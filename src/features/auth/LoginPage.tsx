import { ShimmerButton } from "../../components/buttons/ShimmerButton";
import { useAuth } from "../../hooks/useAuth";

export const LoginPage = () => {
  const { login, logout, user } = useAuth();

  const onSignIn = () => {
    login();
  };

  console.log(user);

  return (
    <div>
      <h1>Welcome to Car Services</h1>
      <ShimmerButton onClick={onSignIn}>Sign in with Google</ShimmerButton>
      <button onClick={logout}>Sign out</button>
    </div>
  );
};
