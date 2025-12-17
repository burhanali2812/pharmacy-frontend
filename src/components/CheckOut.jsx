import React, { useEffect, useState } from "react";
import { showToast } from "./Toastify2";
import { useNavigate } from "react-router-dom";
function CheckOut({ cart, setCart, medicines, setRefresh }) {
  const [invoices, setInvoices] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isClearingCart, setIsClearingCart] = useState(false);
  const grandTotal = cart.reduce((sum, med) => sum + med.totalPrice, 0);
  const percentage = (grandTotal * discount) / 100;
  const discountTotal = grandTotal - percentage;
  const navigate = useNavigate();
  const handleDelete = (medicineID) => {
    const updatedCart = cart.filter((med) => med._id !== medicineID);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };
  const handleClearCart = () => {
    setIsClearingCart(true);
    setCart([]);
    localStorage.removeItem("cart");
    showToast("success", "Cart has been cleared", 3000);
    setTimeout(() => setIsClearingCart(false), 500);
  };
  useEffect(() => {
    if (discount > 100) {
      showToast("error", "Discount Value Cannot be Greater Than 100", 3000);
      setDiscount(0);
      return;
    }
  }, [discount]);

  const generateInvoiceNumber = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const sLetters = "abcdefghijklmnopqrstuvwxyz";
    const randomLetter1 = letters[Math.floor(Math.random() * letters.length)];
    const randomLetter2 = letters[Math.floor(Math.random() * letters.length)];
    const randomLetter3 = sLetters[Math.floor(Math.random() * sLetters.length)];
    const timestamp = Date.now().toString().slice(-4);
    const randomDigits = Math.floor(10 + Math.random() * 90);
    return `${randomLetter1}${timestamp}${randomLetter3}${randomDigits}${randomLetter2}`;
  };
  useEffect(() => {
    const getInvoices = async () => {
      try {
        const response = await fetch(
          "https://pharmacy-backend-beta.vercel.app/invoice/get-invoice",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) {
          console.log("Failed to fetch Invoices");
        }
        const data = await response.json();
        console.log(data);
        setInvoices(data);
      } catch (error) {
        console.error("Error fetching invoices :", error);
      }
    };
    getInvoices();
  }, []);
  const sendInvoices = async (genInvoiceNumber) => {
    try {
      const response = await fetch(
        "https://pharmacy-backend-beta.vercel.app/invoice/add-invoice",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            invoiceNumber: genInvoiceNumber,
            grandTotal: discountTotal,
            medicines: cart.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              totalPrice: item.totalPrice,
            })),
            discount,
            total: grandTotal,
          }),
        }
      );
      if (!response.ok) {
        console.log("Failed to fetch Invoices");
      }
      const data = await response.json();
      console.log(data);
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices :", error);
    }
  };
  const handleCheckout = async () => {
    // Validation checks
    if (cart.length === 0) {
      showToast("warning", "Cart is empty!", 3000);
      return;
    }

    if (discount > 100) {
      showToast("error", "Discount cannot exceed 100%", 3000);
      return;
    }

    setIsCheckingOut(true);

    try {
      let genInvoiceNumber;
      let isUnique = false;

      while (!isUnique) {
        genInvoiceNumber = generateInvoiceNumber();
        const exist = invoices.some(
          (inv) => inv.invoiceNumber === genInvoiceNumber
        );
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
        invoiceNumber: genInvoiceNumber,
      };

      // Update medicine stock in database
      for (const cartMed of cart) {
        const med = medicines.find((med) => med._id === cartMed._id);
        if (!med) continue;
        const newQuantity = med.quantity - cartMed.quantity;

        await fetch(
          `https://pharmacy-backend-beta.vercel.app/medicine/update-medicine/${med._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              sID: med.sID,
              name: med.name,
              quantity: newQuantity,
              price: med.price,
              expire: med.expiry,
            }),
          }
        );
      }

      const checkoutData = {
        actualPrice: cart.reduce(
          (sum, med) => sum + med.actualPrice * med.quantity,
          0
        ),
        salesPrice: grandTotal,
        discountPercentage: discount,
      };

      const response = await fetch(
        "https://pharmacy-backend-beta.vercel.app/auth/addPrice",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(checkoutData),
        }
      );

      if (response.ok) {
        showToast("success", "Checkout completed successfully!", 3000);
        setRefresh(true);
        setCart([]);
        localStorage.removeItem("cart");
        localStorage.setItem("billData", JSON.stringify(billData));
        navigate("/bill");
      } else {
        throw new Error("Failed to process checkout");
      }
    } catch (error) {
      console.error("Error processing checkout:", error);
      showToast("error", "Failed to complete checkout!", 3000);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const increaseQuantity = (incMedicineID, medQuantity) => {
    setCart((prevCart) => {
      const medicineToUpdate = medicines.find(
        (med) => med._id === incMedicineID
      );

      if (!medicineToUpdate) {
        showToast("error", "Medicine not found in cart!", 3000);
        return prevCart;
      }

      if (medQuantity >= medicineToUpdate.quantity) {
        showToast(
          "error",
          `Not enough stock for ${medicineToUpdate.name}`,
          3000
        );

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
    <div className="container mt-4 px-2 px-md-3">
      <h2 className="text-center text-dark mb-4">Checkout</h2>

      <div className="row g-3 g-md-4">
        <div className="col-12 col-lg-8">
          {cart.length === 0 ? (
            <p className="text-center text-warning fs-5">No items in cart</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover text-center">
                <thead>
                  <tr>
                    <th className="d-none d-sm-table-cell">Medicine</th>
                    <th className="d-table-cell d-sm-none">Med</th>
                    <th>Price</th>
                    <th className="d-none d-md-table-cell">Quantity</th>
                    <th className="d-table-cell d-md-none">Qty</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((med, index) => (
                    <tr key={index}>
                      <td
                        className="text-truncate"
                        style={{ maxWidth: "150px" }}
                      >
                        {med.name}
                      </td>
                      <td className="text-nowrap">Rs {med.price}</td>
                      <td>{med.quantity}</td>
                      <td className="text-nowrap">
                        Rs {med.totalPrice.toFixed(2)}
                      </td>
                      <td>
                        <div className="d-flex flex-column flex-sm-row justify-content-center gap-1">
                          <button
                            className="btn btn-outline-warning btn-sm"
                            onClick={() => decreaseQuantity(med._id)}
                          >
                            <i className="fa-solid fa-minus"></i>
                          </button>
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() =>
                              increaseQuantity(med._id, med.quantity)
                            }
                          >
                            <i className="fa-solid fa-plus"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(med._id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="d-flex justify-content-center justify-content-sm-end">
                <button
                  className="btn btn-outline-success my-2"
                  type="button"
                  onClick={handleClearCart}
                  disabled={isClearingCart}
                >
                  {isClearingCart ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      <span className="d-none d-sm-inline">Clearing...</span>
                      <span className="d-inline d-sm-none">Clearing...</span>
                    </>
                  ) : (
                    <>
                      <span className="d-none d-sm-inline">Clear Cart</span>
                      <span className="d-inline d-sm-none">Clear</span>
                      <i className="fa-solid fa-trash-can-arrow-up ms-2"></i>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="col-12 col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header bg-dark text-white">
                <h5 className="card-title mb-0 text-center">SUMMARY</h5>
              </div>
              <div className="card-body p-2 p-md-3">
                <div
                  className="table-responsive"
                  style={{ maxHeight: "300px", overflowY: "auto" }}
                >
                  <table className="table table-striped table-hover align-middle text-center table-sm">
                    <thead className="sticky-top bg-white">
                      <tr>
                        <th className="d-none d-sm-table-cell">Medicine</th>
                        <th className="d-table-cell d-sm-none">Med</th>
                        <th>Price</th>
                        <th className="d-none d-md-table-cell">Quantity</th>
                        <th className="d-table-cell d-md-none">Qty</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((med, index) => (
                        <tr key={index}>
                          <td
                            className="text-truncate"
                            style={{ maxWidth: "100px" }}
                          >
                            {med.name}
                          </td>
                          <td className="text-nowrap">Rs {med.price}</td>
                          <td>{med.quantity}</td>
                          <td className="text-nowrap">
                            Rs {med.totalPrice.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer bg-light p-3 p-md-4">
                <div className="mb-3">
                  <label className="form-label fw-bold mb-2">
                    Discount (%)
                  </label>
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
                    max="100"
                    disabled={isCheckingOut}
                  />
                </div>
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">Total:</h6>
                    <span className="text-success fw-bold">
                      Rs {grandTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">Discount:</h6>
                    <span className="text-success fw-bold">
                      Rs {percentage.toFixed(2)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Grand Total:</h5>
                    <span className="text-success fw-bold fs-5">
                      Rs {discountTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="d-grid">
                    <button
                      className="btn btn-success btn-lg"
                      type="button"
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                    >
                      {isCheckingOut ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          Check Out
                          <i className="fa-solid fa-angles-right ms-2"></i>
                        </>
                      )}
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
