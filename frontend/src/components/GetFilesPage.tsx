import { useState, useEffect, ChangeEvent } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function GetFilesPage() {
  const [files, setFiles] = useState([])
  const [fileToUpload, setFileToUpload] = useState<File>()

  //get username from jwt
  let [username, setUserName] = useState<string>("user1")

  let navigate = useNavigate()

  //load all files from database
  useEffect(() => {

    getFiles()
  }, [])

  async function getFiles() {
    let jwt = JSON.parse(localStorage.getItem("jwt"))
    
    /**
     * check if jwt is in localStorage and if it has
     * the access and refresh properties
     */
    if (jwt['access'] && jwt['refresh']) {
      console.log(jwt)
      //check if access token expired
      if (await tokenHasExpired(jwt['access'])) {
        //check if refresh token expired as well
        if (await tokenHasExpired(jwt['refresh'])) {
          /**
           * clear localStorage and leave this page
           * if both access and refresh tokens have expired
           */
          localStorage.clear()
          navigate("/")
        } else {
          /**
           * if access token has expired but refresh hasn't,
           * get new access token and stay on page
           */

          //call refresh() from django and store it in LS

          //decode username from access token
          //setUserName("")

          document.getElementById("uploadFile").disabled = true
          let response = await fetch(`http://127.0.0.1:8000/api/files/user/${username}/`).then(response => response.json())
          await setFiles(response)
        }
      } else {
        //decode username from access token
        //setUserName("")

        //stay on page if access token has not expired
        document.getElementById("uploadFile").disabled = true
        let response = await fetch(`http://127.0.0.1:8000/api/files/user/${username}/`).then(response => response.json())
        await setFiles(response)
      }
    } else {
      //leave this page if jwt is not found
      navigate("/")
    }
  }

  async function tokenHasExpired(token: string, name: string): boolean {
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
    
    if (response['code'] == 'token_not_valid') {
      tokenExpired = true
    }

    return tokenExpired
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
    formData.append('file', fileToUpload, fileToUpload.name)

    //upload file to server
    await axios.post("http://127.0.0.1:8000/api/upload-file/", formData)
  }

  //displays a file's size in sizes bigger than just bytes
  function getFileSize(fileSize: number): string {
    let fileSizes = ["B", "KB", "MB", "GB"]
    let fileSizeIndex = 0

    while (fileSize >= 1024) {
      fileSize /= 1024
      fileSizeIndex++
    }

    return parseFloat(fileSize.toString()).toFixed(2) + " " + fileSizes[fileSizeIndex]
  }

  //converts the current time in milliseconds to a date
  function getTime(timeStamp: number): string {
    let date = new Date(timeStamp)
    return date.toUTCString()
  }

  //dynamically create more rows for each file
  function FileComponent(): ReactNode {
      return files?.map((file: any) => {
        let downloadURL = `http://127.0.0.1:8000/api/download-file/${file?.name}/`
        let deleteURL = `http://127.0.0.1:8000/api/delete-file/${file?.name}/`
        
        return (
            <tr>
              <th>{file?.name}</th>
              <th>{getFileSize(file?.size)}</th>
              <th>{getTime(file?.date_uploaded)}</th>
              <th>{file?.uploader}</th>
              <th>
                <a href={downloadURL}><button>Download</button></a>
              </th>
              <th>
                <a href={deleteURL}><button>Delete</button></a>
              </th>
            </tr>
        )
      })
    }

    return (
      <div>
        <h1>Your Files</h1>

        <input onChange={getFileInput} type="file" id="fileToUpload"></input>
        <button onClick={uploadFile} id="uploadFile">Upload File</button>
        <br></br>
        <br></br>

        <table> 
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