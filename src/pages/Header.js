import React from 'react'
import {NavLink} from 'react-router-dom'

export default function Header() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light">
            <link href="https://fonts.googleapis.com/css2?family=Jost:wght@100;200&display=swap" rel="stylesheet"></link>
            <div className="container px-4 px-lg-5" >
                <NavLink exact to="/" style = {{textDecoration: 'none', color: "#BEBEBE", fontFamily: "Jost", fontWeight: 700, fontSize: "22px"}}>Support Children</NavLink>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"><span className="navbar-toggler-icon" /></button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent" >
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4" >
                        <li><NavLink exact to="/" style = {{textDecoration: 'none', color: "#BEBEBE", fontFamily: "Jost", fontWeight: 700, fontSize: "17px"}} activeStyle = {{color: "#fff"}}>Home</NavLink></li>
                        {/*<li><NavLink to="/discover" style = {{textDecoration: 'none', color: "#BEBEBE", fontFamily: "Jost", fontWeight: 700}} activeStyle={{color: "#fff"}}>Discover</NavLink></li>*/}
                        <li><NavLink to="/create-campaign" style = {{textDecoration: 'none', color: "#BEBEBE", fontFamily: "Jost", fontWeight: 700, fontSize: "17px"}} activeStyle={{color: '#fff'}}>Create New Campaign</NavLink></li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}