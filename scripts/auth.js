// add admin cloud functions
const adminForm = document.querySelector(".admin-actions")
adminForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const adminEmail = document.querySelector("#admin-email").value
    const addAdminRole = functions.httpsCallable("addAdminRole")

    addAdminRole({ email: adminEmail }).then((result) => {
        console.log(result);
    }).catch(e => {
        console.log(e);
    })
})

// listen for auth states
auth.onAuthStateChanged(user => {
    if (user) {

        // check the claims for the admin property
        user.getIdTokenResult().then(idTokenResult => {
            user.admin = idTokenResult.claims.admin
            setupUI(user)
        })
        // user is logged in
        // get data - live data, real time
        db.collection("guides").onSnapshot(snapshot => {
            setupGuides(snapshot.docs)
            setupUI(user)
        })
    } else {
        setupUI()
        setupGuides([])
    }
})

// create new guider
const createForm = document.querySelector("#create-form")
createForm.addEventListener("submit", (e) => {
    e.preventDefault();
    db.collection("guides").add({
        title: createForm['title'].value,
        content: createForm['content'].value
    }).then(() => {
        const modal = document.querySelector("#modal-create")
        M.Modal.getInstance(modal).close()
        createForm.reset()
    }).catch(err => {
        console.log(err.message)
    })
})

// signup
const signupForm = document.querySelector("#signup-form")
signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // get user info
    const email = signupForm['signup-email'].value
    const password = signupForm['signup-password'].value

    // signup the user 
    auth.createUserWithEmailAndPassword(email, password).then(credential => {
        console.log("user created");
        // create a new users document with the uid of the auth user object#
        // firebase rules should allow creation of new database, this is for the first time
        //     match /{document=**} {
        // allow read, write: if request.time < timestamp.date(2020, 7, 23); }
        return db.collection("users").doc(credential.user.uid).set({
            bio: signupForm['signup-bio'].value,
        }).catch(e => {
            console.log(e);
        })
    }).then(() => {
        const modal = document.querySelector("#modal-signup")
        M.Modal.getInstance(modal).close()
        signupForm.reset()
        signupForm.querySelector(".error").innerHTML = ''
    }).catch(err => {
        signupForm.querySelector(".error").innerHTML = e.message
    })
})

// logout
const logout = document.querySelector("#logout")
logout.addEventListener("click", (e) => {
    e.preventDefault()

    auth.signOut()
})




//login
const loginForm = document.querySelector("#login-form")
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = loginForm['login-email'].value
    const password = loginForm['login-password'].value

    auth.signInWithEmailAndPassword(email, password).then(credential => {

        const modal = document.querySelector("#modal-login")
        M.Modal.getInstance(modal).close()
        loginForm.reset()

        loginForm.querySelector(".error").innerHTML = ''
    }).catch(e => {
        loginForm.querySelector(".error").innerHTML = e.message
    })
})