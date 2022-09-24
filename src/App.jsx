import axios from "axios";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import Folder from "./Folder";

class WorldElement {
  constructor(pData) {
    this.id = pData._id;
    this.parent = pData.parent;
    this.title = pData.title;
    this.description = pData.description;
    this.imageUrl = pData.imageUrl;
    this.category = pData.category;
    this.dateAdded = pData.dateAdded.split('T')[0];
    this.childs = [];
  }

  addChild(child) {
    this.childs.push(child);
  }
}

function App() {

  const [allElements, setAllElements] = useState([])
  const [elements, setElements] = useState([])

  const edit = useRef(false)

  const [toEdit, setToEdit] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('person')
  const [parent, setParent] = useState('root')
  const [image, setImage] = useState('')

  useEffect(() => {
    getAllElements()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getAllElements = async () => {
    await axios.get('https://localhost:50000/worldDB').then(res => {
      mapParents(res.data)
      setAllElements(res.data)
    })
  }

  const findAllChildrens = (parent, list) => {
    const newList = []
    list.forEach(x => {
      if (parent.id === x.parent) {
        const tempParent = parent
        tempParent.addChild(x)
        newList.push(tempParent)
      }
    })
    return newList;
  }

  const fixList = (list, pList) => {
    list.forEach(element => {
      // reemplaza el elemento con un elemento de la lista secundaria
      element = pList.find(x => element.id)
      if (element.childs.length) {
        console.log(element.title + "has childs")
        fixList(element.childs, pList)
      }
    });
  }

  const mapParents = (list) => {
    const parentList = list.map(x => new WorldElement(x))
    parentList.forEach(element => {
      findAllChildrens(element, parentList)
    })

    const filterList = parentList.filter(x => x.parent === 'root')

    fixList(filterList, parentList)

    setElements(filterList)
  }


  function putData() {
    var formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("parent", parent);
    if (image !== '') {
      formData.append("image", image);
    }
    if (edit.current) {
      console.log('https://localhost:50000/worldDB/' + toEdit)
      axios.patch('https://localhost:50000/worldDB/' + toEdit, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(res => console.log(res.response))
    }
    else {
      axios.post('https://localhost:50000/worldDB', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(res => console.log(res.response))
    }
  }

  function loadOrUnloadValues(target) {
    if (target !== '' && edit.current) {
      console.log('Changing')
      const objToEdit = allElements.find(x => x._id === target)
      setTitle(objToEdit.title);
      setDescription(objToEdit.description);
      setCategory(objToEdit.category);
      setParent(objToEdit.parent);
      setImage(objToEdit.image);
    }
    else {
      setTitle('');
      setDescription('');
      setCategory('person');
      setParent('root');
      setImage('');
    }
  }

  return (
    <div className="row">
      <div className="col-1" />

      <div className="container col-6">
        <div className="d-grid gap-3 w-75">
          <p className="h2 text-center"> World View</p>
          {elements.map(x => <Folder key={x.id} explorer={x} />)}
        </div>
      </div>

      <div className="col-4 border shadow p-3 mb-5 bg-body rounded">
        <p className="h2 text-center"> Input a new world element</p>
        <form>

          <div className="input-group mb-3">
            <div className="input-group-text">
              <input className="form-check-input mt-0" type="checkbox" value={edit} onInput={(e) => {
                edit.current = e.target.checked ? true : false
                if (toEdit !== '') {
                  loadOrUnloadValues(toEdit)
                }
              }} />
            </div>
          </div>

          <select
            className="form-select" id='parent-selection'
            value={toEdit} onChange={(e) => {
              setToEdit(e.target.value)
              loadOrUnloadValues(e.target.value)
            }}>
            <option value=''>no one to edit</option>
            {allElements.map(x => <option key={x._id} value={x._id}> {x.title}  </option>)}
          </select>

          <div className="mb-3">
            <label htmlFor="textArea1" className="form-label h6"> Name </label>
            <textarea className="form-control" id="textArea1" rows="1"
              value={title} onChange={(e) => setTitle(e.target.value)} required></textarea>
          </div>

          <p className="h6"> Category </p>
          <select className="form-select" id='category-selection'
            value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="person">Person</option>
            <option value="location">Location</option>
            <option value="item">Item</option>
          </select>

          <p className="h6"> Parent </p>
          <select
            className="form-select" id='parent-selection'
            value={parent} onChange={(e) => setParent(e.target.value)} required>
            <option value='root'>root</option>
            {allElements.map(x => <option key={x._id} value={x._id}> {x.title} </option>)}
          </select>

          <div className="mb-3">
            <label htmlFor="textArea2" className="form-label h6"> Description </label>
            <textarea className="form-control" id="textArea2" rows="3"
              value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
          </div>

          <div className="mb-3">
            <label htmlFor="formFile" className="form-label h6">Load an Image</label>
            <input className="form-control" type="file" id="formFile" onInput={(e) => {
              console.log(e.target.files[0])
              setImage(e.target.files[0])
            }} />
          </div>

          <div className="col-12">
            <button className="btn btn-primary" type="button" onClick={putData}>Submit</button>
          </div>
        </form>
      </div>
      <div className="col-1" />
    </div>
  );
}

export default App;
