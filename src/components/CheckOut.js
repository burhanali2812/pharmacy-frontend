import React, { useEffect, useState } from "react";
import { showToast } from "./Toastify2";
import { useNavigate } from "react-router-dom";
function CheckOut({ cart, setCart, medicines }) {
    const[invoices, setInvoices] = useState([]);
    const [discount, setDiscount] = useState(0);
    const grandTotal = cart.reduce((sum, med) => sum + med.totalPrice, 0);
    const percentage = (grandTotal * discount) / 100
    const discountTotal = grandTotal - percentage;
    const navigate = useNavigate();
    const handleDelete = (medicineID) => {
        const updatedCart = cart.filter((med) => med._id !== medicineID);
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };
    const handleClearCart =()=>{
        setCart([]);
        showToast("success", "Cart has been cleared", 3000);
    }
    useEffect(() => {
        if (discount > 100) {
            showToast("error", "Discount Value Cannot be Greater Than 100", 3000);
            setDiscount(0);
            return;
        }
    }, [discount])

    const generateInvoiceNumber = ()=>{
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
        const sLetters = "abcdefghijklmnopqrstuvwxyz"
        const randomLetter1 = letters[Math.floor(Math.random() * letters.length)];
        const randomLetter2 = letters[Math.floor(Math.random() * letters.length)];
        const randomLetter3 = sLetters[Math.floor(Math.random() * sLetters.length)];
        const timestamp = Date.now().toString().slice(-4); 
        const randomDigits = Math.floor(10 + Math.random() * 90); 
        return `${randomLetter1}${timestamp}${randomLetter3}${randomDigits}${randomLetter2}`;
    };
    useEffect(()=>{
        const getInvoices =async()=>{
            try {
                const response = await fetch('http://localhost:5000/auth/get-invoice', {
                    method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        },
                })
                if(!response.ok){
                    console.log("Failed to fetch Invoices");
                }
                const data = await response.json();
                console.log(data);
                setInvoices(data);
                
            } catch (error) {
                console.error("Error fetching invoices :", error);
            }
        }
        getInvoices();
    }, [])
    const sendInvoices = async(genInvoiceNumber)=>{
            try {
                const response = await fetch('http://localhost:5000/auth/add-invoice', {
                    method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify({invoiceNumber: genInvoiceNumber, grandTotal: discountTotal,medicines: cart.map(item =>({
                            name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    totalPrice: item.totalPrice
                        })),
                        discount,
                        total: grandTotal
                    })
                })
                if(!response.ok){
                    console.log("Failed to fetch Invoices");
                }
                const data = await response.json();
                console.log(data);
                setInvoices(data);
                
            } catch (error) {
                console.error("Error fetching invoices :", error);
            }
    }
    const handleCheckout = async () => {
        let genInvoiceNumber;
        let isUnique = false;
    
        while (!isUnique) {
            genInvoiceNumber = generateInvoiceNumber();
            const exist = invoices.some((inv) => inv.invoiceNumber === genInvoiceNumber);
            if (!exist) {
                isUnique = true;
            }
        }
    
        await sendInvoices(genInvoiceNumber);
    
        const billData = {
            cart: cart,
            grandTotal: grandTotal,
            discount: discount,
            discountTotal: discountTotal,
            invoiceNumber: genInvoiceNumber
        };
    
        try {
            // Update medicine stock in database
            for (const cartMed of cart) {
                const med = medicines.find(med => med._id === cartMed._id);
                if (!med) continue;
                const newQuantity = med.quantity - cartMed.quantity;
    
                await fetch(`http://localhost:5000/auth/update-medicine/${med._id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({ 
                        sID: med.sID, 
                        name: med.name, 
                        quantity: newQuantity, 
                        price: med.price, 
                        expire: med.expiry 
                    }) // Updating only the quantity
                });
            }
    

            const checkoutData = {
                actualPrice: cart.reduce((sum, med) => sum + (med.actualPrice * med.quantity), 0), 
                salesPrice: grandTotal, 
                discountPercentage: discount 
            };
    
        const response =     await fetch("http://localhost:5000/auth/addPrice", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(checkoutData)
            });
            if(response.ok){
                showToast("success", "Sales price updated", 3000)
            }
            const data = await response.json();
            console.log(data);
            
    
            setCart([]); 
            localStorage.setItem("billData", JSON.stringify(billData));
            navigate("/bill");
    
        } catch (error) {
            console.error("Error processing checkout:", error);
            showToast("error", "Failed to complete checkout!", 3000);
        }
    };
    

    const increaseQuantity = (incMedicineID, medQuantity) => {
        setCart((prevCart) => {
            const medicineToUpdate = medicines.find((med) => med._id === incMedicineID);

            if (!medicineToUpdate) {
                showToast("error", "Medicine not found in cart!", 3000);
                return prevCart;
            }

            if (medQuantity >= medicineToUpdate.quantity) {
                showToast("error", `Not enough stock for ${medicineToUpdate.name}`, 3000);

                return prevCart;
            }
            let updatedCart = prevCart.map((med) => {
                if (med._id === incMedicineID) {
                    return {
                        ...med,
                        quantity: med.quantity + 1,
                        totalPrice: (med.quantity + 1) * med.price,
                    };
                }
                return med;
            });

            localStorage.setItem("cart", JSON.stringify(updatedCart));
            return updatedCart;
        });
    };

    const decreaseQuantity = (decMedicineID) => {
        setCart((prevCart) => {
            let updatedCart = prevCart
                .map((med) => {
                    if (med._id === decMedicineID) {
                        if (med.quantity === 1) {
                            return null;
                        }
                        return {
                            ...med,
                            quantity: med.quantity - 1,
                            totalPrice: (med.quantity - 1) * med.price,
                        };
                    }
                    return med;
                })
                .filter((med) => med !== null);

            localStorage.setItem("cart", JSON.stringify(updatedCart));
            return updatedCart;
        });
    };
    return (
        <div className="container mt-4">

            <h2 className="text-center text-dark">Checkout</h2>


            <div className="d-flex">

                <div className="flex-grow-1 me-4">
                    {cart.length === 0 ? (
                        <p className="text-center text-warning">No items in cart</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped table-hover text-center">
                                <thead>
                                    <tr>
                                        <th>Medicine</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Total</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map((med, index) => (
                                        <tr key={index}>
                                            <td>{med.name}</td>
                                            <td>Rs {med.price}</td>
                                            <td>{med.quantity}</td>
                                            <td>Rs {med.totalPrice.toFixed(2)}</td>
                                            <td>
                                                <button
                                                    className="btn btn-outline-warning btn-sm mx-1"
                                                    onClick={() => decreaseQuantity(med._id)}
                                                >
                                                    <i className="fa-solid fa-minus"></i>
                                                </button>
                                                <button
                                                    className="btn btn-outline-success btn-sm mx-1"
                                                    onClick={() => increaseQuantity(med._id, med.quantity)}
                                                >
                                                    <i className="fa-solid fa-plus"></i>
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger btn-sm mx-1"
                                                    onClick={() => handleDelete(med._id)}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="d-flex justify-content-end">
                                <button className="btn btn-outline-success mx-2 my-2" type="submit" onClick={handleClearCart}>

                                    Clear Cart
                                    <i className="fa-solid fa-trash-can-arrow-up mx-2"></i>
                                </button>
                            </div>
                        </div>


                    )}
                </div>

                {cart.length > 0 && (
                    <div className="card" style={{ width: "350px" }}>
                        <div className="card-header bg-dark text-white">
                            <h5 className="card-title mb-0 text-center">SUMMARY</h5>
                        </div>
                        <div className="card-body table-responsive">
                            <table className="table table-striped table-hover text-center">
                                <thead>
                                    <tr>
                                        <th>Medicine</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map((med, index) => (
                                        <tr key={index}>
                                            <td>{med.name}</td>
                                            <td>Rs {med.price}</td>
                                            <td>{med.quantity}</td>
                                            <td>Rs {med.totalPrice.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="card-footer bg-light p-4">
                            <div className="row align-items-center mb-3">
                                <div className="col-md-5">
                                    <p className="mb-0"><b>Discount (%)</b></p>
                                </div>
                                <div className="col-md-7">
                                    <input
                                        className="form-control"
                                        placeholder="Enter discount"
                                        type="number"
                                        value={discount}
                                        onChange={(e) => {
                                            const value = parseFloat(e.target.value);
                                            if (!isNaN(value) && value >= 0) {
                                                setDiscount(value);
                                            } else {
                                                setDiscount(0);
                                            }
                                        }}
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <h6 className="text-end my-3">
                                        Total: <span className="text-success">Rs {grandTotal.toFixed(2)}</span>
                                    </h6>
                                    <h6 className="text-end my-3">
                                        Discount: <span className="text-success">Rs {percentage}</span>
                                    </h6>
                                    <h5 className="text-end my-3">
                                        Grand Total: <span className="text-success">Rs {discountTotal.toFixed(2)}</span>
                                    </h5>


                                    <div className="d-flex justify-content-end">
                                        <button className="btn btn-outline-success my-2" type="submit" onClick={handleCheckout}>
                                            Check Out
                                            <i className="fa-solid fa-angles-right mx-2"></i>
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                )}
            </div>
        </div>
    );
}

export default CheckOut;