import React, { useState } from 'react';
import  { showToast } from "./Toastify2"; 

function MedicineModal({ medicine, onAddToCart, onClose }) {
    const [quantity, setQuantity] = useState(1);
    const totalPrice = medicine.price * quantity;

    const handleQuantityChange = (e) => {
        let value = parseInt(e.target.value, 10);
        if (value < 1 || isNaN(value)) value = 1;
        setQuantity(value);
    };

    const handleAddToCart = () => {
        if(quantity > medicine.quantity){
            showToast("error",`Not enough stock for ${medicine.name}!`, 3000); 
            showToast("info",`Available stock for ${medicine.name} is ${medicine.quantity}`, 3000); 
            return;
        }
        onAddToCart({ ...medicine, quantity, totalPrice });
        showToast("success","Item added to cart successfully!", 3000); // Show success toast
    };

    return (
        <div>
            
            <div className="modal fade show d-block" style={{ display: "block", background: "rgba(0,0,0,0.5)" }} tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Buy Medicine</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Name:</strong> {medicine.name}</p>
                            <p><strong>Price:</strong> {medicine.price}</p>
                            <label><strong>Quantity:</strong></label>
                            <input
                                type="number"
                                className="form-control"
                                value={quantity}
                                onChange={handleQuantityChange}
                                min="1"
                            />
                            <button className="btn btn-outline-dark mt-3" onClick={handleAddToCart}>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MedicineModal;
