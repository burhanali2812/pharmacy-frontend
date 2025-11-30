import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";


function Bill_invoice() {
    const {id} = useParams();
    const [invoice, setInvoice] = useState(null);
    console.log("Fetching invoice for ID:", id);
    useEffect(() => {
      const fetchInvoice = async () => {
        try {
            console.log("Fetching invoice for ID:", id);
          const response = await fetch(`http://localhost:5000/auth/get-invoice/${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
  
          if (!response.ok) {
            console.error("Failed to fetch invoice");
            return;
          }
  
          const data = await response.json();
          setInvoice(data);
        } catch (error) {
          console.error("Error fetching invoice:", error);
        }
      };
  
      fetchInvoice();
    }, [id]);
  
    if (!invoice) {
      return <h2 className="text-center">Loading Invoice...</h2>;
    }

    const handlePrint = () => {
        window.print();   

    };
  return (
    <div>
         <div className="container mt-4">
            <div className="card"  style={{ maxWidth: "500px", margin: "auto" }}>
                <div className="card-header bg-dark text-white text-center">
                    <h5>Pharmacy Bill</h5>
                </div>
                <div className="card-body">
                        <p><b>Invoice# : </b> {invoice.invoiceNumber}</p>
                    
                    <div>
                        <p><b>Date/Time : </b>{new Date(invoice.createdAt).toLocaleString()}</p>
                    </div>
                    <table className="table table-striped text-center">
                        <thead>
                            <tr>
                                <th>Medicine</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.medicines.map((med, index) => (
                                <tr key={index}>
                                    <td>{med.name}</td>
                                    <td>Rs {med.price}</td>
                                    <td>{med.quantity}</td>
                                    <td>Rs {med.totalPrice.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <hr />
                    <p className="text-end"><b>Total:</b> Rs {invoice.total.toFixed(2)}</p>
                    <p className="text-end"><b>Discount:</b> {invoice.discount}% </p>
                    <h5 className="text-end text-success"><b>Grand Total: Rs {invoice.grandTotal.toFixed(2)}</b></h5>
                </div>

            </div>
            <div className="d-flex justify-content-end">
                <button className="btn btn-outline-success" onClick={handlePrint}>
                    Print Bill
                </button>
            </div>
        </div>
    </div>
  )
}

export default Bill_invoice
