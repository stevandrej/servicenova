import { Sparkles } from "../../components/sparkles/sparkles";
import { GoogleLoginButton } from "./components/google-login-button/google-login.button";

export const LoginPage = () => {
  return (
    <Sparkles title="Service Nova" fullHeight>
      <div className="flex align-middle justify-center mt-10">
        <GoogleLoginButton />
      </div>
    </Sparkles>
  );
};
