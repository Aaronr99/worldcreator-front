import axios from 'axios';
// eslint-disable-next-line 
import { Collapse } from 'bootstrap'
import { useState } from 'react';

function Folder({ explorer }) {

    const [reload, setReload] = useState(false)

    async function DeleteChar() {
        if(explorer.id === 'mising'){
            return
        }
        await axios.delete('https://worldcreator-api.herokuapp.com/worldDB/' + explorer.id)
        .then(res => {
            console.log(res)
            setTimeout(window.location.reload(), 3000)
        })
    }

    return (
        <div className="card">

            <div className="card-body">
                <div className='row'>
                    <button className="btn btn-dark col-2" type="button" data-bs-toggle="collapse" data-bs-target={"#" + explorer.title.replace(' ', '') + "childs"} aria-expanded="false" aria-controls={explorer.title.replace(' ', '') + "childs"}>
                        {explorer.title}
                    </button>

                    <button className="btn btn-primary col-2" type="button" data-bs-toggle="collapse" data-bs-target={"#" + explorer.title.replace(' ', '') + "det"} aria-expanded="false" aria-controls={explorer.title.replace(' ', '') + "det"}>
                        Details
                    </button>

                    <div className='col-6' />

                    <button className="btn btn-danger col-2" type="button" onClick={DeleteChar}>
                        Delete
                    </button>
                </div>

                <div className="collapse row g-0" id={explorer.title.replace(' ', '') + "det"}>
                    <img className='col-2' src={explorer.imageUrl} alt='' />

                    <div className="card card-body col-10">
                        <p><small> {'Category: ' + explorer.category}</small></p>
                        <p><small> {"Date Added: " + explorer.dateAdded}</small></p>
                        <p>{explorer.description}</p>
                    </div>
                </div>
                <div>
                    {(explorer.childs.length > 0) &&
                        <div className="collapse" id={explorer.title.replace(' ', '') + "childs"}>
                            <div className="card card-body">
                                {
                                    explorer.childs.map((explore) => (
                                        <Folder key={explore.id} explorer={explore} />
                                    ))
                                }
                            </div>
                        </div>}
                </div>
            </div>
        </div>
    );
}

export default Folder;