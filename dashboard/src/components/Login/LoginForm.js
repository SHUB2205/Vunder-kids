import "./LoginForm.css";
import Logo from "../images/Logo.png";

function LoginForm() {
  return (
    <>
      <div class="logo">
          <img src={Logo} />
      </div>
      
      <div class="container">
          <div class="card">
            <div className="tileContainer">
              <h1>Welcome Back</h1>
              <p>Log in to your account</p>
            </div>
              
              <form>
                  <div class="form-group">
                      <label>Email</label>
                      <input type="email" class="form-control" placeholder="Enter your email" />
                  </div>
                  
                  <div class="form-group">
                      <label>Password</label>
                      <input type="password" class="form-control" placeholder="Enter your password" />
                  </div>
                  
                  <div class="checkbox-group">
                      <input type="checkbox" id="remember" />
                      <label for="remember">Remember me?</label>
                  </div>
                  
                  <button class="btn">Log in</button>
                  <p >Forgot password?</p>
                  <div class="divider">
                      <span>or</span>
                  </div>
                  
                  <button class="google-btn">
                      <img src="/api/placeholder/20/20" alt="Google" />
                      Sign in with Google
                  </button>
                  <button class="btn">
                      Sign Up
                  </button>
              </form>
          </div>
      </div>
    </>
  );
};

export default LoginForm;