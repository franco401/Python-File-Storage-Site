import { useState, useEffect, ChangeEvent } from "react"
import axios from "axios"

export default function GetFilesPage() {
  const [files, setFiles] = useState([])
  const [fileToUpload, setFileToUpload] = useState<File>()
  let [username, setUserName] = useState<string>("user5")

  //load all files from database
  useEffect(() => {
    getFiles()
    document.getElementById("uploadFile").disabled = true
  }, [])

  async function getFiles() {
    let response = await fetch(`http://127.0.0.1:8000/api/files/user/${username}`).then(response => response.json())
    await setFiles(response)
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
    await axios.post("http://127.0.0.1:8000/api/upload-file", formData)
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
        let url = `http://127.0.0.1:8000/api/download-file/${file?.name}`
        return (
            <tr>
              <th><img style={{'width': '32px', 'height': '32px'}} src="file_icon.png"></img>{file?.name}</th>
              <th>{getFileSize(file?.size)}</th>
              <th>{getTime(file?.date_uploaded)}</th>
              <th>{file?.uploader}</th>
              <th>
                <a href={url}><button>Download</button></a>
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
            </tr>

          <FileComponent/>
          </tbody>

        </table>

      </div>
    )
  }