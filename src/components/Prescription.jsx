import React,{useState} from 'react'

function Prescription({medicines}) {
        const [searchQuery, setsearchQuery] = useState("");
    const filteredMedicines = medicines.filter((med) =>
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (med.sID && String(med.sID).toLowerCase().includes(searchQuery.toLowerCase())) ||
    med.prescription.toLowerCase().includes(searchQuery.toLowerCase())
    );
  return (
    <div className='conatainer'>
        <h1 style={{ textAlign: 'center' }} className='my-3'>PHARMACY MANAGEMENT SYSTEM</h1>
            <h2 style={{ textAlign: 'center' }} className='my-3 mb-3'>EDIT-MEDICINE</h2>
            <label className="form-label my-3"><b>Search Medicine</b></label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search Medicine By Id or Name or Prescription"
                    value={searchQuery}
                    onChange={(e) => setsearchQuery(e.target.value)}
                />
      <table className="table table-striped table-hover text-left my-3">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Medicine ID</th>
                            <th>Medicine Name</th>
                            <th>Price</th>
                            <th>Prescription</th>
                            
                            
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMedicines.length > 0 ? (
                            filteredMedicines.map((med, index) => (
                                <tr key={med._id}>
                                    <td>{index + 1}</td>
                                    <td>{med.sID}</td>
                                    <td>{med.name}</td>
                                    <td>{med.price}</td>
                                    <td>{med.prescription}</td>
                                    
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">No medicines found</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                
    </div>
  )
}

export default Prescription
