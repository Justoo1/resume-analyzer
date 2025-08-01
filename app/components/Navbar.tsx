import { Link } from "react-router"
import { CVRefineLogo } from "./logo"

const Navbar = () => {
  return (
    <nav className="navbar">
        <Link to="/">
            {/* <p className="text-2xl font-bold text-gradient">CVRefine</p> */}
            <CVRefineLogo size="medium" />
        </Link>
        <Link to="/upload" className="primary-button w-fit">
            Upload CV
        </Link>
        <Link to="/wipe" className="secondary-button w-fit">Wipe Data</Link>
    </nav>
  )
}

export default Navbar