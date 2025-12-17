import React, { useState } from 'react'
import { showToast } from "./Toastify2";
import MedicineModal from "./MedicineModal";
import "./MedicineTable.css";
function BuyMedicine({ cart, setCart, medicines, setMedicines }) {
    const [selectedBuyMedicines, setselectedBuyMedicines] = useState(null);
    const [searchQuery, setsearchQuery] = useState("");


    const filteredMedicines = medicines.filter((med) =>
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (med.sID && String(med.sID).toLowerCase().includes(searchQuery.toLowerCase()))
    );
    const outOfStockCount = medicines.filter(med => med.quantity === 0).length;
    const lowStockCount = medicines.filter(med => med.quantity > 0 && med.quantity < 10).length;
    const expireMedicines = medicines.filter(med => new Date(med.expire) < new Date()).length;
    const handleBuyButton = (smedicines) => {
        let isPresent = cart.some((med) => med._id === smedicines._id);
        const isExpired = new Date(smedicines.expire) < new Date();

        if (smedicines.quantity === 0) {
            showToast("error", `Not enough stock for ${smedicines.name}!`, 3000);
            showToast("info", `Available stock: ${smedicines.quantity}`, 3000);
            return;
        }

        if (isExpired) {
            showToast("error", `${smedicines.name} has expired!`, 3000);
            return;
        }
        console.log(isPresent);
        if (isPresent) {
            showToast("warning", "Medicine Already Present in Cart Please Update or Delete it", 3000);
            return;
        }
        setselectedBuyMedicines(smedicines);
    }
    const handleCart = (medicineWithQuantity) => {

        setCart([...cart, medicineWithQuantity]);
        console.log("Cart Updated:", cart);
        setselectedBuyMedicines(null);
    }
    return (
        <div>

            <div className="container">
                <h1 style={{ textAlign: 'center' }} className='my-3'>PHARMACY MANAGEMENT SYSTEM</h1>
                <h2 style={{ textAlign: 'center' }} className='my-3 mb-3'>PURCHASE-MEDICINE</h2>
                <label className="form-label my-3"><b>Search Medicine</b></label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search Medicine By Id or Name"
                    value={searchQuery}
                    onChange={(e) => setsearchQuery(e.target.value)}
                />
                <div className="d-flex justify-content-end" style={{ marginTop: 30 }}>
                    <div className="d-flex align-items-center me-3">
                        <span className="color-box" style={{ backgroundColor: "rgb(167, 81, 20)", width: "12px", height: "12px", display: "inline-block", borderRadius: "3px" }}></span>
                        <span className="ms-2">Out of Stock: {outOfStockCount}</span>
                    </div>
                    <div className="d-flex align-items-center me-3">
                        <span className="color-box" style={{ backgroundColor: "#FF8C00", width: "12px", height: "12px", display: "inline-block", borderRadius: "3px" }}></span>
                        <span className="ms-2">Low Stock: {lowStockCount}</span>
                    </div>
                    <div className="d-flex align-items-center">
                        <span className="color-box" style={{ backgroundColor: "rgb(255, 0, 0)", width: "12px", height: "12px", display: "inline-block", borderRadius: "3px" }}></span>
                        <span className="ms-2">Expired Medicine: {expireMedicines}</span>
                    </div>
                </div>

<div className='table-responsive mt-3'>
    
                <table className="table table-striped table-hover align-middle text-center responsive-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Medicine ID</th>
                            <th>Medicine Name</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Supplier</th>
                            <th>Expiry Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMedicines.length > 0 ? (
                            filteredMedicines.map((med, index) => {
                                const isExpired = new Date(med.expire) < new Date(); // Check if expired
                                return (
                                    <tr
                                        key={med._id}
                                        className={
                                            isExpired
                                                ? "expired"
                                                : med.quantity < 10
                                                    ? (med.quantity === 0 ? "end-stock" : "low-stock")
                                                    : ""
                                        }
                                    >
                                        <td>{index + 1}</td>
                                        <td>{med.sID}</td>
                                        <td>{med.name}</td>
                                        <td>{med.quantity}</td>
                                        <td>{med.price}</td>
                                        <td>{med.supplier}</td>
                                        <td>{med.expire}</td>
                                        <td>
                                            <button className="btn btn-outline-dark btn-sm mx-1" onClick={() => handleBuyButton(med)}>
                                                <i className="fas fa-cart-plus"></i>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">No medicines found</td>
                            </tr>
                        )}
                    </tbody>

                </table>

</div>
                {selectedBuyMedicines && (
                    <MedicineModal
                        medicine={selectedBuyMedicines}
                        onAddToCart={handleCart}
                        onClose={() => setselectedBuyMedicines(null)}
                    />
                )}



            </div>



        </div>
    )
}

export default BuyMedicine
