import { useNavigate } from "react-router-dom"
import { useState } from "react";

import 'bootstrap/dist/css/bootstrap.css';


export default function LoginPage() {
    let navigate = useNavigate()

    //error message to show user when logging in fails
    let [statusMessage, setStatusMessage] = useState("")
    let [displayValue, setDisplayValue] = useState("none")
    let [displayColor, setDisplayColor] = useState("")

    async function login(event: ChangeEvent<HTMLInputElement>) {

        event.preventDefault()

        let email = event.currentTarget.email.value
        let password = event.currentTarget.password.value

        let inputFields = {
            'email': email,
            'password': password
        }

        let unfinishedFields = 0

        /**
         * count how many input fields are unfinished
         * and show the user the unfinished ones in red
         * and the finished ones in green
         */
        for (let field in inputFields) {
            if (inputFields[field] == '') {
                document.getElementById(field).style.borderColor = 'red'
                unfinishedFields++
            } else {
                document.getElementById(field).style.borderColor = 'green';
            }
        }

        if (unfinishedFields > 0) {
            alert(`You have ${unfinishedFields} unfinished inputs`)
        } else {
            let response = await fetch("http://127.0.0.1:8000/api/token/", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(inputFields)
            }).then(response => response.json())

            //check if response returned jwt token
            if (response['refresh'] || response['access']) {
                localStorage.setItem("jwt", JSON.stringify(response))

                await setStatusMessage("Success: Logged in succesfully")
                await setDisplayValue("grid")
                await setDisplayColor("green")

                //go to files page if login is successful
                navigate("/files")
            } else {
                await setStatusMessage("Error: The username and/or password is invalid")
                await setDisplayValue("grid")
                await setDisplayColor("red")
            }
        }
    }

    return (
        <div>
            <h1 style={{"textAlign": "center"}}>Login</h1>
            <form className="form-control" onSubmit={login}>
                <label className="form-label">Email</label>
                <input className="form-control" id="email"></input>
                <br></br>
                <label className="form-label">Password</label>
                <input className="form-control" id="password" type="password"></input>
                <br></br>
                <button className="btn btn-primary">Login</button>
                <br></br>
                <span>Don't have an account yet? Create one <a href="/register">here</a></span>
                <p style={{"display": displayValue, "color": displayColor}}>{statusMessage}</p>
            </form>
        </div>
    )
}