import { Sparkles } from "../../components/sparkles/Sparkles";
import { useAuth } from "../../hooks/useAuth";
import { GoogleLoginButton } from "./components/GoogleLoginButton/GoogleLoginButton";

export const LoginPage = () => {
  const { user } = useAuth();
  console.log(user);

  return (
    <div>
      <Sparkles title="ServiceNova" fullHeight>
        <div className="flex align-middle justify-center mt-10">
          <GoogleLoginButton />
        </div>
      </Sparkles>
    </div>
  );
};
