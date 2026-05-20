import Header from "../components/Header";
import Main from "../components/Main";
import Footer from "../components/Footer";

function LayoutDefault () {
  return (
    <div className="layout-default">
      <Header /> 
      <Main />
      <Footer/>
    </div>
  )
}

export default LayoutDefault;