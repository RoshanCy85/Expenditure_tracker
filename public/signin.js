
document.getElementById("validateEmailButton").addEventListener("click", async () => {
    console.log("hh")
    const email = document.getElementById("email").value;
    const emailError = document.getElementById("emailError");

    try {
        const response = await fetch("/validate-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        

        if (response.status === 200) {
            // Email is valid, move to the next step
            //TODO: 
            
            document.getElementById("validateEmailButton").style.display = "none";
            document.getElementById("signInStep").style.display = "block";
        } else {
            // Email not found
            emailError.style.display = "block";
        }
    } catch (error) {
        console.error("Error validating email:", error);
    }
});
