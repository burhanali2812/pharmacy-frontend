import React , { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import * as XLSX from "xlsx";
function OutOfStockMedicines({outOfStock}) {
  const [searchQuery, setsearchQuery] = useState("");
        const filteredMedicines = outOfStock.filter((med) =>
            med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (med.sID && String(med.sID).toLowerCase().includes(searchQuery.toLowerCase()))
        );
        const exportToPDF = () => {
            const doc = new jsPDF();
            doc.text("Out Of Stock Medicines Report", 14, 10);
    
            const tableColumn = ["Medicine ID", "Medicine Name", "Quantity", "Price", "Supplier Name", "Expiry Date"];
            const tableRows = outOfStock.map(med => [med.sID, med.name, med.quantity, med.price, med.supplier, med.expire]);
    
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
            });
    
            doc.save("outOfStockMedicines.pdf");
        };
        const exportToCSV = () => {
            const tableColumn = ["Medicine ID", "Medicine Name", "Quantity", "Price", "Supplier Name", "Expiry Date"];
            const tableRows = outOfStock.map(med => [
                med.sID, med.name, med.quantity, med.price, med.supplier, med.expire
            ]);
    
            const csvData = Papa.unparse({
                fields: tableColumn,
                data: tableRows,
            });
    
            const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
            saveAs(blob, "outOfStockMedicines.csv");
        };
        const exportToExcel = () => {
            const tableData = outOfStock.map(med => ({
                "Medicine ID": med.sID,
                "Medicine Name": med.name,
                "Quantity": med.quantity,
                "Price": med.price,
                "Supplier Name": med.supplier,
                "Expiry Date": med.expire,
            }));
    
            const worksheet = XLSX.utils.json_to_sheet(tableData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Medicines");
    
            XLSX.writeFile(workbook, "outOfStockMedicines.xlsx");
        };
        return (
            <div className='container'>
                <h1 style={{ textAlign: 'center' }} className='my-3'>PHARMACY MANAGEMENT SYSTEM</h1>
                <h2 style={{ textAlign: 'center' }} className='my-3 mb-3'>OUT OF STOCK MEDICINES</h2>
                <label className="form-label my-3"><b>Search Medicine</b></label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search Medicine By Id or Name"
                    value={searchQuery}
                    onChange={(e) => setsearchQuery(e.target.value)}
                />
                <div className="d-flex justify-content-between align-items-center " style={{ marginTop: 30 }}>
    <div className="d-flex align-items-center">   
                <button onClick={exportToCSV} className="btn btn-primary btn-sm me-2">
                    <i className="fa-solid fa-file-csv me-2"></i>CSV
                </button>
                <button onClick={exportToExcel} className="btn btn-success btn-sm me-2">
                    <i className="fa-solid fa-file-excel me-2"></i>Excel
                </button>
                <button onClick={exportToPDF} className="btn btn-danger btn-sm">
                    <i className="fa-solid fa-file-pdf me-2"></i>PDF
                </button>
            
        
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
                            <th>Supplier Name</th>
                            <th>Expiry Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMedicines.length > 0 ? (
                            filteredMedicines.map((med, index) => (
                                <tr key={med._id}>
                                    <td>{index + 1}</td>
                                    <td>{med.sID}</td>
                                    <td>{med.name}</td>
                                    <td>{med.quantity}</td>
                                    <td>{med.price}</td>
                                    <td>{med.supplier}</td>
                                    <td>{med.expire}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">No Expired medicines found</td>
                            </tr>
                        )}
                    </tbody>
                </table>

               </div>
            </div>
        )
}

export default OutOfStockMedicines
