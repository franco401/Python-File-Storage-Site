import { useEffect } from "react"

export default function HomePage() {
    useEffect(() => {
        document.title = "Home Page"
    }, [])

    return (
        <div>
            <h1 style={{"textAlign": "center"}}>Python File Storage Site</h1>

            <div className="mb-3">
            <a href="/login">Login</a>
            <br></br>
            <a href="/register">Register Account</a>
            <br></br>
            <a href="/files">Files</a>
            </div>

        </div>
    )
}