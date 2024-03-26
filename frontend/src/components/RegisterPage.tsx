import { useNavigate } from "react-router-dom"

import 'bootstrap/dist/css/bootstrap.css';
import { useEffect, useState } from "react";


export default function RegisterPage() {
    useEffect(() => {
        document.title = "Register Page"
    })
    
    let navigate = useNavigate()

    //error message to show user when registering fails
    let [statusMessage, setStatusMessage] = useState("")
    let [displayValue, setDisplayValue] = useState("none")

    async function registerAccount(event: ChangeEvent<HTMLInputElement>) {
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
            try {
                let response = await fetch("http://127.0.0.1:8000/api/register/", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(inputFields)
                })

                if (response['status'] === 200) {
                    //go to login page if registration is successful
                    navigate("/login")
                } else {
                    await setStatusMessage("Error: This username is already taken")
                    await setDisplayValue("grid")
                }
            } catch {
                await setStatusMessage("Error: This username is already taken")
                await setDisplayValue("grid")
            }
        }
    }

    //testing account deletion
    async function deleteAccount() {
        let postData = {
            'email': 'user1@example.com'
        }

        let response = await fetch("http://127.0.0.1:8000/api/delete-user/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            }).then(response => response.json())
    }

    return (
        <div>
            <h1 style={{"textAlign": "center"}}>Register Account</h1>
            <form className="form-control" onSubmit={registerAccount}>
                <label className="form-label">Email</label>
                <input className="form-control" id="email"></input>
                <br></br>
                <label className="form-label">Password</label>
                <input className="form-control" id="password" type="password"></input>
                <br></br>
                <button className="btn btn-primary">Register Account</button>
                <br></br>
                <span>Already have an account? Login <a href="/login">here</a></span>
                <p style={{"display": displayValue, "color": "red"}}>{statusMessage}</p>
            </form>
        </div>
    )
}