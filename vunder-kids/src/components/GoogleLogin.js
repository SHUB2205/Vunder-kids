import React  from 'react';
// import Alertcontext from '../../createcontext/Alert/AlertContext';
// import { useNavigate} from "react-router-dom"

export default function LoginPage() {
//   let navigate = useNavigate();

  // const {showalert}=useContext(Alertcontext);
  const loginWithGoogle =() => {
   const json=window.open("http://localhost:5000/api/auth/google", "_self");
   console.log(json);
    if(json.success===true){

       sessionStorage.setItem('token',json.token);
    //    console.log(json);
       navigate('/register/about');
      //  showalert({grole:json.role,gshow:true,gmsg:json.msg})
    }else {
    //   console.log(json.msg);
      // showalert({grole:json.role,gshow:true,gmsg:json.msg})
    }
  }

  return (
    <>
      
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body text-center">
                <h5 className="card-title">Login with Google</h5>
                <button className="btn btn-danger btn-block" onClick={loginWithGoogle}>
                  <i className="fab fa-google mr-2"></i> Sign in with Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
