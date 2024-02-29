import { useState, useEffect } from "react"

export default function GetFilesPage() {
    const [files, setFiles] = useState([])

    /*
    async function getFile(fileName: string) {
      let response = await fetch(`http://127.0.0.1:8000/api/get-file/${fileName}`).then(response => response.json())
      await setFile(response)
    }
    */

    async function getFiles() {
      let response = await fetch("http://127.0.0.1:8000/api/get-files").then(response => response.json())
      await setFiles(response)
    }

    //load all files from database
    useEffect(() => {
      getFiles()
    }, [])

    
    //dynamically create more rows for each file
    function FileComponent(): ReactNode {
        return files?.map((file: any) => {
          let url = `http://127.0.0.1:8000/api/download-file/${file?.name}`
          return (
              <tr>
                <th>{file?.name}</th>
                <th>{file?.size}</th>
                <th>{file?.date_uploaded}</th>
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

        <table>
          
          <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Date Uploaded</th>
            <th>Download</th>
          </tr>

        <FileComponent/>

        </table>

      </div>
    )
  }