import React, { Component } from 'react';
import { FaHome,FaUserGraduate, FaUserEdit,FaMoneyCheckAlt,FaMoon, FaLanguage,FaAdjust, FaSun } from "react-icons/fa";
import fma from "../assets/fma.png";

class Navigation extends Component {
    
    constructor(props){
        super(props);
        this.state = { 
            menuState: false, 
            activeMenu: 'dashboard', 
            theme: 'light',
            dropdownOpen: false,
        };
    }

    toggleMenu = () => {
        this.setState(prevMenu => ({ menuState : !prevMenu.menuState }));
    }
    toggleDropdown = () => {
        this.setState((prevDrop) => ({ dropdownOpen : !prevDrop.dropdownOpen }));
    }
    handleclick = (menu) => {
        this.setState(({ activeMenu : menu }));
    }
    handleThemeChange = (theme) => {
        this.setState({ theme, dropdownOpen: false });
        document.body.setAttribute('data-bs-theme', theme);
    } 

    render() {
        const { menuState, activeMenu, theme } = this.state;
                
        const menus = [
            { type: 'link', name: 'dashboard', icon: <FaHome size={25} className='mx-1'/>},
            { type: 'dropdown', name: 'formation',icon: <FaUserEdit size={25} className='mx-1' />, items: [
                    { name: "Académique" , value: "inscription-académique" },
                    { name: "Professionnelle" , value: "inscription-professionnelle" },
                ]
            },
            { type: 'link', name: 'paiement', icon: <FaMoneyCheckAlt  size={25} className='mx-1'/>}
        ];

        return (
            <div>
                <header className="navbar navbar-expand-md shadow py-3 px-4">
                    <div className="container-fluid">
                        <img src={fma} alt="Logo" className="rounded-circle me-3" width={80} />
                            <h2 className="fw-bold text-primary ">FMA Anjarasoa Ankofafa</h2>
                        <button className="navbar-toggler" type="button"
                        data-bs-toggle="collapse" data-bs-target="#navbarNav"
                        aria-controls="navbarNav" aria-expanded={menuState} aria-label="Toggle navigation"
                        onClick={this.toggleMenu}>
                        {menuState ? (
                            <span style={{ fontSize: "1.5rem" }}>&#x2715;</span>
                        ) : (
                            <span className="navbar-toggler-icon"></span>
                        )}
                        </button>

                        <div className={`collapse navbar-collapse ${menuState ? "show" : ""}`} id="navbarNav">
                            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                                {menus.map(menuObj => (
                                menuObj.type === 'link'
                                    ? (
                                    <li key={menuObj.name} className="nav-item mx-2 text-center fw-bold">
                                        <a href="#" className={'nav-link ' + (activeMenu === menuObj.name ? 'active fw-bold text-info border-bottom border-3 border-info' : '')}
                                        onClick={() => { this.handleclick(menuObj.name);this.setState({ menuState: false });}}>
                                            {menuObj.icon}{menuObj.name.charAt(0).toUpperCase() + menuObj.name.slice(1)}
                                        </a>
                                    </li>
                                    )
                                    : (
                                    <li key={menuObj.name} className="nav-item dropdown mx-2">
                                        <a href="#" className={'nav-link dropdown-toggle fw-bold mx-3 ' + (activeMenu.startsWith(menuObj.name) ? 'text-info border-bottom border-3 border-info' : '')}
                                        id={`${menuObj.name}Dropdown`}role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        {menuObj.icon}{menuObj.name.charAt(0).toUpperCase() + menuObj.name.slice(1)}
                                        </a>
                                        <ul className="dropdown-menu" aria-labelledby={`${menuObj.name}Dropdown`}>
                                        {menuObj.items.map(item => (
                                            <li key={item.value}>
                                                <button className="dropdown-item" onClick={() => { this.handleclick(item.value) + this.setState({ menuState: false }) + this.props.onNavigateToLogin() }}>
                                                    {item.name}
                                                </button>
                                            </li>
                                        ))}
                                        </ul>
                                    </li>
                                    )
                                ))}

                                <li className="nav-item dropdown mx-2">
                                    <a className="nav-link dropdown-toggle fw-bold" style={{ cursor: "pointer" }}
                                        href="#" id="themeDropdown" onClick={ this.toggleDropdown }
                                        role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <FaAdjust size={25} className='mx-1'/>Thème
                                    </a>
                                    <ul className="dropdown-menu" aria-labelledby="themeDropdown">
                                        <li>
                                            <button className={`dropdown-item ${theme === 'light' ? 'active' : ''}`}
                                                onClick={() => this.handleThemeChange('light') + this.setState(() => ({ menuState : false }))}>
                                                <FaSun size={25} className='mx-1' /> Mode Claire
                                            </button>
                                        </li>
                                        <li>
                                            <button className={`dropdown-item ${theme === 'dark' ? 'active' : ''}`}
                                                onClick={() => this.handleThemeChange('dark') + this.setState(() => ({ menuState : false }))}>
                                                <FaMoon size={25} className='mx-1' /> Mode Sombre
                                            </button>
                                        </li>
                                    </ul>
                                </li>

                                
                            </ul>

                            <button onClick={() => {
                                if(window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
                                    this.props.onLogout();
                                }
                            }} className="btn btn-danger rounded-pill ms-3">
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </header>
            </div>
        );
    }
}

export default Navigation;