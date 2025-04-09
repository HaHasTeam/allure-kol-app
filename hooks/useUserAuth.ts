import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useEffect, useState } from "react";

// import useFirebaseAuth from "../api/useFirebaseAuth";

import { useSession } from "@/contexts/AuthContext";
import { errorMessage } from "@/constants";
import { firebaseAuth } from "@/utils/firebase";
import useFirebase from "./api/useFirebase";

const useUserAuth = () => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
  const [error, setError] = useState<string | null>(null);
  const { firebaseToken, saveFirebaseToken } = useSession();
  const { createCustomToken } = useFirebase();

  if (firebaseToken && !user && firebaseToken.length > 0) {
    firebaseAuth
      .signInWithCustomToken(firebaseToken)
      .then((result) => {
        setUser(result.user);
      })
      .catch((err) => {
        setError(errorMessage.ERM033);
        console.log(err);
      });
  }

  useEffect(() => {
    (async () => {
      if (!(firebaseToken && firebaseToken.length > 0)) {
        const result = await createCustomToken();
        console.log("====================================");
        console.log("result", result);
        console.log("====================================");
        if (typeof result === "string" || !result) {
          setError(result || errorMessage.ERM033);
        } else {
          saveFirebaseToken(result.data.token);
        }
      }
    })();
  }, []);

  return { user, error };
};

export default useUserAuth;
