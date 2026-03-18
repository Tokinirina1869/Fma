import React, { useState, useEffect, useContext } from "react";
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Divider, Avatar, Button, Box, Stack } from "@mui/material";
import { Menu as MenuIcon, Home, School, PersonAdd, MonetizationOn, Share,
  Logout, Brightness4, Brightness7, AccountCircle } from "@mui/icons-material";
import { FaHome, FaSignOutAlt, FaComments, FaQuestionCircle, FaUser, FaUserGraduate, FaUserPlus, FaSchool, FaSpeakap } from "react-icons/fa";
import fma from "../../assets/fma.png";
import { AuthContext } from "../Users/AuthContext";

const NavigationPage = ({ handleMenuChange, onLogout, onProfil}) => {
  const { user } = useContext(AuthContext);
  const role = user?.role; // Récupération du rôle

  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [elevate, setElevate] = useState(false);

  const getAllMenus = () => [
    { key: "dashboard", text: "Dashboard", icon: <Home color="primary" />, label: "Tableau de Bord", iconDesktop: <FaHome size={20} color="primary" /> },
    { key: "eleve", text: "Lycée", icon: <PersonAdd color="primary" />, label: "Lycée", iconDesktop: <FaUserPlus size={20} color="primary" /> },
    { key: "formation", text: "CFP", icon: <School color="primary" />, label: "CFP", iconDesktop: <FaUserGraduate size={20} color="primary" /> },
    { key: "paiement", text: "Paiement", icon: <MonetizationOn color="primary" />, label: "Paiement", iconDesktop: <MonetizationOn size={20} /> },
    { key: "chat", text: "Conversation", icon: <FaComments color="primary" />, label: "Conversation", iconDesktop: <FaComments size={20} color="primary" /> },
  ];

  // Filtrer les menus en fonction du rôle
  const getMenusByRole = () => {
    const allMenus = getAllMenus();
    if (role === 'directrice' || role === 'bde') {
      return allMenus; 
    }
    if (role === 'secretaire_lycee') {
      return allMenus.filter(m => m.key === 'eleve' || m.key === 'paiement' || m.key == "chat");
    }
    if (role === 'secretaire_cfp') {
      return allMenus.filter(m => m.key === 'formation' || m.key === 'paiement' || m.key == "chat");
    }
    return []; 
  };

  const allowedMenus = getMenusByRole();

  // Initialiser le menu actif avec le premier autorisé si nécessaire
  useEffect(() => {
    if (allowedMenus.length > 0 && !allowedMenus.some(m => m.key === activeMenu)) {
      setActiveMenu(allowedMenus[0].key);
    }
  }, [role, allowedMenus]);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setElevate(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-bs-theme", newTheme);
  };

  const handleMenuClick = (name) => {
    handleMenuChange(name);
    setActiveMenu(name);
    setMobileOpen(false);

    const section = document.getElementById(name);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Drawer (mobile)
  const drawer = (
    <Box sx={{ width: 240 }} role="presentation">
      <Box sx={{ textAlign: "center", p: 2 }}>
        <img src={fma} alt="FMA" width={60} />
        <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
          FMA Anjarasoa
        </Typography>
      </Box>
      <Divider />
      <List>
        {allowedMenus.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton onClick={() => handleMenuClick(item.key)} selected={activeMenu === item.key}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider/>
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleThemeToggle}>
            <ListItemIcon>{theme === "light" ? <Brightness4 /> : <Brightness7 />}</ListItemIcon>
            <ListItemText primary={theme === "light" ? "Mode sombre" : "Mode clair"} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={onProfil}>
            <ListItemIcon><AccountCircle color="primary" /></ListItemIcon>
            <ListItemText primary="Profil" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={onLogout}>
            <ListItemIcon><Logout color="error" /></ListItemIcon>
            <ListItemText primary="Déconnexion" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  // Menus desktop (construits dynamiquement)
  const desktopMenus = allowedMenus.map(menu => ({
    key: menu.key,
    label: menu.label,
    icon: menu.iconDesktop
  }));

  return (
    <>
      <AppBar
        position="fixed"
        color="default"
        elevation={elevate ? 4 : 0}
        sx={{
          transition: "all 2s ease",
          p: 2, boxShadow: 3,
          backgroundColor: theme === "light" ? "#fff" : "#1e1e2f",
          color: theme === "light" ? "#000" : "#fff",
        }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start"
            onClick={toggleDrawer} sx={{ display: { md: "none" }, mr: 2 }}>
            <MenuIcon />
          </IconButton>

          <img src={fma} alt="Logo FMA" width={45} style={{ marginRight: 10 }} />
          <Typography variant="h6"
            sx={{ flexGrow: 1, fontWeight: "bold", cursor: "pointer" }}
            onClick={() => allowedMenus.some(m => m.key === 'dashboard') && handleMenuClick("dashboard")}>
            FMA Laura Vicuna
          </Typography>

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
            <Stack direction="row" spacing={2}>
              {desktopMenus.map((menu) => {
                const isActive = activeMenu === menu.key;
                return (
                  <Button
                    key={menu.key}
                    onClick={() => handleMenuClick(menu.key)}
                    sx={{
                      textTransform: "none",
                      fontWeight: "bold",
                      fontSize: "18px",
                      px: 3,
                      py: 1.2,
                      color: isActive
                      ? theme === "light" ? "primary.main" : "#fff"
                      : theme === "light" ? "text.primary" : "#fff",
                      borderBottom: isActive ? "3px solid" : "3px solid transparent",
                      borderRadius: 0,
                      transition: "all 0.3s",
                      "&:hover": {
                        color: "primary.main",
                        borderBottom: "3px solid",
                        borderColor: "primary.dark",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {menu.icon} {menu.label}
                    </Box>
                  </Button>
                );
              })}
            </Stack>

            <IconButton color="inherit" onClick={handleThemeToggle} sx={{ ml: 2 }}>
              {theme === "light" ? <Brightness4 /> : <Brightness7 />}
            </IconButton>

            <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
              <Avatar alt={user?.name} src={user?.photo || fma} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={mobileOpen} onClose={toggleDrawer} sx={{ display: { md: "none" } }} >
        {drawer}
      </Drawer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={onProfil}><FaUser size={18} color="blue" className="mx-1" /> Voir le profil</MenuItem>
        <MenuItem onClick={onLogout} sx={{ color: "red" }}>
          <FaSignOutAlt size={18} className="mx-1" /> Se déconnecter
        </MenuItem>
      </Menu>
      <Box sx={{ pt: "80px" }} />
    </>
  );
};

export default NavigationPage;
