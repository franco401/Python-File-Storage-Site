export default function RegisterPage() {
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
            let response = await fetch("http://127.0.0.1:8000/api/register-user", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(inputFields)
            }).then(response => response.json())
        }
    }

    //testing account deletion
    async function deleteAccount() {
        let postData = {
            'email': 'user1@example.com'
        }

        let response = await fetch("http://127.0.0.1:8000/api/delete-user", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            }).then(response => response.json())
    }

    return (
        <div>
            <form onSubmit={registerAccount}>
                <label>Email</label>
                <input id="email"></input>
                <br></br>
                <label>Password</label>
                <input id="password" type="password"></input>
                <br></br>
                <button>Register Account</button>
            </form>
        </div>
    )
}