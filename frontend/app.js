async function loadUsers() {
    try {
        const response = await fetch("/api/users");

        const users = await response.json();

        const table = document.getElementById("users");

        table.innerHTML = "";

        users.forEach(user => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
            `;

            table.appendChild(row);
        });

    } catch (error) {

        console.error(error);

        document.getElementById("message").innerText =
            "Unable to load users";
    }
}


async function addUser() {

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    if (!name || !email) {

        document.getElementById("message").innerText =
            "Please enter name and email";

        return;
    }

    try {

        const response = await fetch("/api/users", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name,
                email: email
            })

        });

        const data = await response.json();

        document.getElementById("message").innerText =
            data.message;

        document.getElementById("name").value = "";
        document.getElementById("email").value = "";

        loadUsers();

    } catch (error) {

        console.error(error);

        document.getElementById("message").innerText =
            "Unable to add user";
    }
}


loadUsers();
