import { useState, useEffect, ChangeEvent } from "react"

//used for file uploading
import axios from "axios"

//used for page navigation
import { useNavigate } from "react-router-dom"

import 'bootstrap/dist/css/bootstrap.css';

export default function GetFilesPage() {
  const [files, setFiles] = useState([])
  const [fileToUpload, setFileToUpload] = useState<File>()

  let jwt = JSON.parse(localStorage.getItem("jwt"))

  //get username from jwt
  let [username, setUserName] = useState(() => {
    try {
      return jwt['username']
    } catch {
      //let page render and logout user
    }
  })

  //simple message depending if user has files or not yet
  let [msg, setMsg] = useState("Your Files")

  //user's remaining storage and storage limit
  let [storageInfo, setStorageInfo] = useState({})

  let navigate = useNavigate()

  //load all files from database
  useEffect(() => {
    authenticateUser()
  }, [])

  //performs get request for user files
  async function getUserData() {
    //get user's files
    document.getElementById("uploadFile").disabled = true
    let userFiles = await fetch(`http://127.0.0.1:8000/api/files/user/${username}/`).then(response => response.json())
    await setFiles(userFiles)
    if (userFiles.length == 0) {
      setMsg("You currently have no files.")
    }

    //get user's storage info
    let storageInfo = await fetch(`http://127.0.0.1:8000/api/userstorage/${username}/`).then(response => response.json())
    await setStorageInfo(storageInfo)
  }

  //handles user authentication for allowing user on page
  async function authenticateUser() {    
    //make sure the jwt is in localStorage
    if (jwt !== null) {
      /**
       * check if jwt is in localStorage and if it has
       * the access and refresh properties
       */
      if (jwt['access'] && jwt['refresh'] && jwt['username']) {
        //check if access token expired
        if (await tokenHasExpired(jwt['access'])) {
          alert("Access token expired")
          //check if refresh token expired as well
          if (await tokenHasExpired(jwt['refresh'])) {
            logOut()
          } else {
            alert("Refresh token is good, refreshing access now!")
            /**
              * if access token has expired but refresh hasn't,
              * get new access token and stay on page
              */
            await refreshToken(jwt['refresh'])
            await getUserData()
          }
        } else {
          alert("Access token is good")
          //stay on page if access token has not expired
          await getUserData()
        }
      } else {
        //leave this page if access and refresh are not in jwt
        navigate("/")
      }
    } else {
      //leave this page if jwt is not in localStorage
      navigate("/")
    }
  }
  
  //checks if a given access or refresh token has expired 
  async function tokenHasExpired(token: string): boolean {
    let tokenExpired = false

    let postData = {
      'token': token
    }

    let response = await fetch("http://127.0.0.1:8000/api/token/verify/", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    }).then(response => response.json())
    
    /**
     * checks if the server returns a response
     * saying the token is invalid
     */
    if (response['code'] == 'token_not_valid') {
      tokenExpired = true
    }

    return tokenExpired
  }

  //refreshs an access token with a given refresh token
  async function refreshToken(token: string) {
    let postData = {
      'refresh': token
    }

    let response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    }).then(response => response.json())
    
    //checks if the refresh token has expired
    if (response['code'] == 'token_invalid') {
      alert("refresh not working?!", response)
      logOut()
    } else {
      //create new jwt using same refresh and new access
      let newJWT = {
        'refresh': jwt['refresh'],
        'access': response['access'],
        'username': jwt['username']
      }
      //replace old jwt with new, refreshed one
      localStorage.removeItem('jwt')
      localStorage.setItem('jwt', JSON.stringify(newJWT))
      alert("made new jwt")
      console.log("new jwt: ", newJWT)
    }
  }

  //get the file to be uploaded
  function getFileInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.currentTarget.files[0] != null) {
      setFileToUpload(event.currentTarget.files[0])
      document.getElementById("uploadFile").disabled = false
    } else {
      document.getElementById("uploadFile").disabled = true
    }
  }

  //upload file to server
  async function uploadFile() {
    //create form data to upload file to server
    let formData = new FormData()
    
    //append username to file name to get the name of file uploader
    formData.append('file', fileToUpload, `${username}|` + fileToUpload.name)

    //upload file to server
    await axios.post("http://127.0.0.1:8000/api/upload-file/", formData)
  
    window.location.reload()
    //await setFiles((files) => [...files, ])
  }

  //displays a file's size in sizes bigger than just bytes
  function getFileSize(fileSize: number): string {
    let fileSizes = ["B", "KB", "MB", "GB"]
    let fileSizeIndex = 0

    while (fileSize >= 1024) {
      fileSize /= 1024
      fileSizeIndex++
    }

    return parseFloat(fileSize?.toString()).toFixed(2) + " " + fileSizes[fileSizeIndex]
  }

  //converts the current time in milliseconds to a date
  function getTime(timeStamp: number): string {
    let date = new Date(timeStamp)
    return date.toUTCString()
  }

  function renameFile(fileName: string) {
    alert(fileName)
  }

  async function deleteFile(fileName: string) {
    let deleteURL = `http://127.0.0.1:8000/api/delete-file/${fileName}/`

    let postData = {
      'username': username,
      'fileName': fileName
    }

    let response = await fetch(deleteURL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    }).then(response => response.json())

    console.log(response)
  }

  //dynamically create more rows for each file
  function FileComponent(): ReactNode {
      return files?.map((file: any) => {
        let downloadURL = `http://127.0.0.1:8000/api/download-file/${file?.name}/`
        
        return (
            <tr>
              <th onClick={() => renameFile(file?.name)}>{file?.name}</th>
              <th>{getFileSize(file?.size)}</th>
              <th>{getTime(file?.date_uploaded)}</th>
              <th>{file?.uploader}</th>
              <th>
                <a href={downloadURL}><button className="btn btn-success">Download</button></a>
              </th>
              <th>
              <button onClick={() => deleteFile(file?.size)} className="btn btn-danger">Delete</button>
              </th>
            </tr>
        )
      })
    }

    /**
    * clear localStorage and leave this page
    * if both access and refresh tokens have expired
    */
    function logOut() {
      localStorage.clear()
      navigate("/")
    }

    return (
      <div>
        <h1 style={{"textAlign": "center"}}>Welcome back, {username}!</h1>

        <div className="mb-3">
        <button className="btn btn-primary" onClick={logOut}>Logout</button>
        <input className="form-control" onChange={getFileInput} type="file" id="fileToUpload"></input>
        <button className="btn btn-primary" onClick={uploadFile} id="uploadFile">Upload File</button>
        </div>

        <h2>{msg}</h2>

        <div className="mb-3">
          <div>Remaining storage: {getFileSize(storageInfo['remaining_storage'])}</div>
          <div>Storage Limit: {getFileSize(storageInfo['storage_limit'])}</div>
        </div>


        <table className="table"> 
          <tbody>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Date Uploaded</th>
              <th>Uploader</th>
              <th>Download</th>
              <th>Delete</th>
            </tr>

          <FileComponent/>
          </tbody>

        </table>

      </div>
    )
  }