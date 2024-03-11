import { useNavigate } from "react-router-dom"

export default function LoginPage() {
    let navigate = useNavigate()

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

                //go to files page if login is successful
                navigate("/files")
            } else {
                alert("Invalid user credentials.")
            }
        }
    }

    return (
        <div>
            <form onSubmit={login}>
                <label>Email</label>
                <input id="email"></input>
                <br></br>
                <label>Password</label>
                <input id="password" type="password"></input>
                <br></br>
                <button>Login</button>
            </form>
        </div>
    )
}