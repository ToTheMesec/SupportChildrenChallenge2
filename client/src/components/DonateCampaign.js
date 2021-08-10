import React, {Fragment, useState} from 'react';

const DonateCampaign = ({camp, contract, account}) => {
    
    const [raised, setRaised] = useState(camp.raised);

    const updateRaised = async (e) => {
        e.preventDefault();
        try {
            const body = {raised};
            const response = await fetch(`http://localhost:5000/campaigns/${camp.camp_id}`, {
                method: "PUT",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify(body)
            });

            window.location = "/";
        } catch (err) {
            console.log(err.message);
        }
    }

    return(
        <Fragment>
            {/* <!-- Button to Open the Modal --> */}
            <button type="button" className="btn btn-warning" data-toggle="modal" data-target={`#id${camp.camp_id}`}>
            Edit
            </button>

            {/* <!-- The Modal --> */}
            <div className="modal" id={`id${camp.camp_id}`}>
            <div className="modal-dialog">
                <div className="modal-content">

                {/* <!-- Modal Header --> */}
                <div className="modal-header">
                    <h4 className="modal-title">Edit todo</h4>
                    <button type="button" className="close" data-dismiss="modal" >&times;</button>
                </div>

                {/* <!-- Modal body --> */}
                <div className="modal-body">
                    <input type = "text" className = "form-control" value = {raised} onChange = {e => setRaised(e.target.value)}/>
                </div>

                {/* <!-- Modal footer --> */}
                <div className="modal-footer">
                    <button type = "button" className = "btn btn-warning" data-dismiss="modal" onClick = {e => updateRaised(e)}>Edit</button>
                    <button type="button" className="btn btn-danger" data-dismiss="modal">Close</button>
                </div>

                </div>
            </div>
            </div>
        </Fragment>
    );
};

export default DonateCampaign;