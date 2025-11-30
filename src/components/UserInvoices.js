import React, { useState, useEffect } from 'react';
import { showToast } from "./Toastify2";

import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom"; 
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import * as XLSX from "xlsx";

function UserInvoices({role}) {
    const [invoices, setInvoices] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const getInvoices = async () => {
            try {
                const response = await fetch('http://localhost:5000/auth/get-invoice', {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                });
                if (!response.ok) {
                    console.log("Failed to fetch Invoices");
                }
                const data = await response.json();
                setInvoices(data);
            } catch (error) {
                console.error("Error fetching invoices:", error);
            }
        };
        getInvoices();
    }, []);

    const viewInvoice = (id) => {
         navigate(`/bill-Invoice/${id}`);
    };

    const handleDeleteInvoice = async (invoice) => {
        if (!invoice) return;

        const result = await Swal.fire({
            title: "Are you sure?",
            text: `You are about to delete Invoice "${invoice.invoiceNumber}"`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`http://localhost:5000/auth/delete-invoice/${invoice._id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                console.log("Failed to delete invoice");
                return;
            }
            showToast("success", `Invoice ${invoice.invoiceNumber} deleted successfully`, 3000);
            setInvoices((prev) => prev.filter((inv) => inv._id !== invoice._id));
        } catch (error) {
            console.error("Error deleting invoice:", error);
        }
    };

    const filteredInvoices = invoices.filter((inv) =>
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Invoices Report", 14, 10);

        const tableColumn = ["Invoice Number", "Invoice Date/Time","Grand Total"];
        const tableRows = filteredInvoices.map(med => [med.invoiceNumber, new Date(med.createdAt).toLocaleString(), med.grandTotal.toFixed(2)]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
        });

        doc.save("invoices.pdf");
    };
    const exportToCSV = () => {
        const tableColumn =  ["Invoice Number", "Invoice Date/Time","Grand Total"];
        const tableRows = filteredInvoices.map(med => [med.invoiceNumber, new Date(med.createdAt).toLocaleString(), med.grandTotal.toFixed(2)]);
        const csvData = Papa.unparse({
            fields: tableColumn,
            data: tableRows,
        });

        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "invoices.csv");
    };
    const exportToExcel = () => {
        const tableData = filteredInvoices.map(med => ({
            "Invoice Number": med.invoiceNumber,
            "Invoice Date/Time": new Date(med.createdAt).toLocaleString(),
            "Grand Total": med.grandTotal.toFixed(2),
        }));

        const worksheet = XLSX.utils.json_to_sheet(tableData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Medicines");

        XLSX.writeFile(workbook, "invoices.xlsx");
    };


    return (
        <div className="container">
            <h1 className="my-3 text-center">PHARMACY MANAGEMENT SYSTEM</h1>
            <h2 className="my-3 mb-3 text-center">USER-INVOICES</h2>

            <label className="form-label my-3"><b>Search Invoice</b></label>
            <input
                type="text"
                className="form-control"
                placeholder="Search Invoices by Invoice Number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
             {role === 'admin'? (  <div className="row my-3 g-1 d-flex align-items-center">
                    <div className="col-auto">
                        <button onClick={exportToCSV} className="btn btn-primary btn-sm">
                            <i className="fa-solid fa-file-csv me-2"></i>CSV
                        </button>
                    </div>
                    <div className="col-auto">
                        <button onClick={exportToExcel} className="btn btn-success btn-sm">
                            <i className="fa-solid fa-file-excel me-2"></i>Excel
                        </button>
                    </div>
                    <div className="col-auto">
                        <button onClick={exportToPDF} className="btn btn-danger btn-sm">
                            <i className="fa-solid fa-file-pdf me-2"></i>PDF
                        </button>
                    </div>
                </div>):("")}

            <table className="table table-striped table-hover text-center my-3">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Invoice Number</th>
                        <th>Invoice Date/Time</th>
                        <th>Grand Total</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredInvoices.length > 0 ? (
                        filteredInvoices.map((inv, index) => (
                            <tr key={inv._id}>
                                <td>{index + 1}</td>
                                <td>{inv.invoiceNumber}</td>
                                <td>{new Date(inv.createdAt).toLocaleString()}</td>
                                <td>{inv.grandTotal.toFixed(2)}</td>
                                <td>
                                    <button 
                                        className="btn btn-outline-dark btn-sm mx-1"
                                        onClick={() => viewInvoice(inv._id)}
                                    >
                                        <i className="fa-solid fa-eye"></i>
                                    </button>
                                   {role === 'admin' ? ( <button 
                                        className="btn btn-outline-danger btn-sm mx-1"
                                        onClick={() => handleDeleteInvoice(inv)}
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>):("")}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center">No Invoices found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default UserInvoices;
