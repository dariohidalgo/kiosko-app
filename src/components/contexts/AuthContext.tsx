const checkAdminRole = async (user: User) => {
  try {
    console.log("Checking admin role for user:", user.uid);
    // Método 1: Verificar Custom Claims
    const idTokenResult = await user.getIdTokenResult();
    console.log("User claims:", idTokenResult.claims); // ¡MUY IMPORTANTE!

    if (idTokenResult.claims.admin === true) { // O idTokenResult.claims.role === 'admin'
      console.log("User is admin via claims.");
      setUserRole("admin");
      return;
    }

    // Método 2: Verificar en Firestore
    console.log("Checking Firestore for role...");
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      console.log("Firestore user data:", userDoc.data());
      if (userDoc.data().role === "admin") {
        console.log("User is admin via Firestore.");
        setUserRole("admin");
        return;
      }
    } else {
      console.log("User document not found in Firestore for UID:", user.uid);
    }

    console.log("User is not admin, setting role to seller.");
    setUserRole("seller");
  } catch (error) {
    console.error("Error al verificar rol:", error);
    setUserRole("seller"); // Por defecto, asumimos rol de vendedor
  }
};
