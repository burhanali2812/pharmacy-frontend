import React, { useRef, useEffect, useState } from "react";

const Bill = () => {
    const [billData, setBillData] = useState(null);
    const [dateTime, setDateTime] = useState({
        date: "",
        time: "",
    });
    const billRef = useRef();

    useEffect(() => {
        const now = new Date();

        setDateTime({
            date: now.toLocaleDateString("en-GB"), // "27/02/2025" (DD/MM/YYYY)
            time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }), // "10:30:45 AM"
        });
    }, []);
    useEffect(() => {
        const storedBillData = localStorage.getItem("billData");
        if (storedBillData) {
            setBillData(JSON.parse(storedBillData));
        }
    }, []);


    if (!billData) {
        return <h4 className="text-center text-danger">No bill available</h4>;
    }
    const handlePrint = () => {
        if (!billRef.current) {
            console.error("Bill section not found!");
            return;
        }

        const printContents = billRef.current.innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;

    };

    return (
        <div className="container mt-4">
            <div className="card" ref={billRef} style={{ maxWidth: "500px", margin: "auto" }}>
                <div className="card-header bg-dark text-white text-center">
                    <h5>Pharmacy Bill</h5>
                </div>
                <div className="card-body">
                {billData.invoiceNumber ? (
                        <p><b>Invoice# :</b> {billData.invoiceNumber}</p>
                    ) : (
                        <p>No invoices found.</p>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                        <p><b>Date:</b> {dateTime.date}</p>
                        <p><b>Time:</b> {dateTime.time}</p>
                    </div>
              <div className="table-responsive mt-3">
                     <table className="table table-striped table-hover align-middle text-center responsive-table">
                        <thead>
                            <tr>
                                <th>Medicine</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billData.cart.map((med, index) => (
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
                    <hr />
                    <p className="text-end"><b>Total:</b> Rs {billData.grandTotal.toFixed(2)}</p>
                    <p className="text-end"><b>Discount:</b> {billData.discount}% </p>
                    <h5 className="text-end text-success"><b>Grand Total: Rs {billData.discountTotal.toFixed(2)}</b></h5>
                </div>

            </div>
            <div className="d-flex justify-content-end">
                <button className="btn btn-outline-success" onClick={handlePrint}>
                    Print Bill
                </button>
            </div>
        </div>
    );
};

export default Bill;
