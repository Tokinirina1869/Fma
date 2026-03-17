import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
  Typography,
  Chip
} from "@mui/material";
import { MonetizationOn, Close, CheckCircle, Cancel } from "@mui/icons-material";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const monthOptions = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

// const autresFrais = ["Droit d'inscription", "Frais Scolaires", "VRM", "Tenue de fête", "Tenue de Sport", "Blouse"];

// Animations
const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: -50
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.5
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.3
    }
  }
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4
    }
  })
};

const statusVariants = {
  paid: {
    scale: [1, 1.1, 1],
    backgroundColor: "#10B981",
    transition: { duration: 0.5 }
  },
  unpaid: {
    scale: [1, 1.05, 1],
    backgroundColor: "#EF4444",
    transition: { duration: 0.5 }
  }
};

const buttonHover = {
  scale: 1.05,
  transition: { duration: 0.2 }
};

const buttonTap = {
  scale: 0.95
};

export default function CarteEcolage({ matricule, open, handleClose }) {
  const [moisPayes, setMoisPayes] = useState([]);
  const [autresPayes, setAutresPayes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autresFrais, setAutresFrais] = useState([]);

  useEffect(() => {
    if (!matricule || !open) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [EcolageRes, FraisRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/ecolage/${matricule}`),
          axios.get(`http://localhost:8000/api/frais`)
        ]);

        // Récupérer tous les noms de frais
        const FraisSansEcolage = FraisRes.data
            .filter(frais => !frais.nomfrais.toLowerCase().includes("ecolage"))
            .map(frais => frais.nomfrais);
        
        setMoisPayes(EcolageRes.data.moisPayes || []);
        setAutresPayes(EcolageRes.data.autresFraisPayes || []);
        setAutresFrais(FraisSansEcolage);
      } catch (err) {
        console.error("Erreur:", err);
        setMoisPayes([]);
        setAutresPayes([]);
        setAutresFrais([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [matricule, open]);

  const getStatusIcon = (paid) => (
    paid ? (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <CheckCircle sx={{ fontSize: 20, marginRight: 1 }} />
      </motion.div>
    ) : (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Cancel sx={{ fontSize: 20, marginRight: 1 }} />
      </motion.div>
    )
  );

  const StatusChip = ({ paid, label }) => (
    <motion.div variants={statusVariants} initial="initial" animate={paid ? "paid" : "unpaid"} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
    >
      <Chip
        icon={getStatusIcon(paid)}
        label={label}
        sx={{ backgroundColor: paid ? "#10B981" : "#EF4444", color: "white", fontWeight: "bold", fontSize: "0.875rem", px: 1, minWidth: 100
        }}
      />
    </motion.div>
  );

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidthPaperComponent={motion.div}
          PaperProps={{
            variants: modalVariants,
            initial: "hidden",
            animate: "visible",
            exit: "exit"
          }}
        >
          {/* Header avec animation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DialogTitle className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <Box className="flex items-center justify-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <MonetizationOn sx={{ fontSize: 32 }} />
                </motion.div>
                <Typography variant="h4" className="fw-bold">
                  Carte Ecolage Scolaire
                </Typography>
              </Box>
              <Typography variant="subtitle1" className="text-indigo-100 mt-1">
                Matricule: {matricule}
              </Typography>
            </DialogTitle>
          </motion.div>

          <DialogContent className="p-4 bg-gray-50">
            {loading ? (
              // Loading State
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center py-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"
                />
                <Typography className="ml-3 text-gray-600">
                  Chargement des données...
                </Typography>
              </motion.div>
            ) : (
              <>
                {/* --- Table des frais mensuels --- */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6"
                >
                  <Typography variant="h6" className="text-center mb-3 text-gray-800 font-bold"
                    sx={{ 
                      background: 'linear-gradient(45deg, #4F46E5, #7E22CE)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    📅 Écolage Mensuel
                  </Typography>
                  <TableContainer component={Paper} 
                    sx={{ 
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      overflow: 'hidden'
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.main' }}>
                          <TableCell align="center" 
                            sx={{ 
                              color: 'white', 
                              fontWeight: 'bold',
                              fontSize: '1rem',
                              py: 2
                            }}
                          >
                            Mois
                          </TableCell>
                          <TableCell 
                            align="center" 
                            sx={{ 
                              color: 'white', 
                              fontWeight: 'bold',
                              fontSize: '1rem',
                              py: 2
                            }}
                          >
                            Statut
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {monthOptions.map((month, index) => {
                          const paid = moisPayes.includes(month);
                          return (
                            <motion.tr key={month} custom={index} variants={tableRowVariants} initial="hidden" animate="visible"
                              whileHover={{ 
                                backgroundColor: '#f8fafc',
                                transition: { duration: 0.2 }
                              }}
                            >
                              <TableCell 
                                align="center" 
                                sx={{ 
                                  fontWeight: "600",
                                  fontSize: '0.95rem',
                                  py: 2,
                                  borderBottom: '1px solid #e2e8f0'
                                }}
                              >
                                {month}
                              </TableCell>
                              <TableCell 
                                align="center"
                                sx={{ 
                                  py: 2,
                                  borderBottom: '1px solid #e2e8f0'
                                }}
                              >
                                <StatusChip paid={paid} label={paid ? "Payé" : "Non payé"} />
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Résumé des mois payés */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-3 text-center"
                  >
                    <Typography variant="body2" className="text-gray-600">
                      {moisPayes.length > 0 ? (
                        <span>
                          ✅ <strong>{moisPayes.length}</strong> mois payés sur {monthOptions.length}
                        </span>
                      ) : (
                        <span className="text-red-500">
                          ❌ Aucun mois payé
                        </span>
                      )}
                    </Typography>
                  </motion.div>
                </motion.div>

                {/* --- Table des autres frais --- */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6"
                >
                  <Typography 
                    variant="h6" 
                    className="text-center mb-3 text-gray-800 font-bold"
                    sx={{ 
                      background: 'linear-gradient(45deg, #059669, #0D9488)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    💰 Autres Frais
                  </Typography>
                  <TableContainer 
                    component={Paper} 
                    sx={{ 
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      overflow: 'hidden'
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'success.main' }}>
                          <TableCell 
                            align="center" 
                            sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', py: 2
                            }}
                          >
                            Type de Frais
                          </TableCell>
                          <TableCell 
                            align="center" 
                            sx={{ 
                              color: 'white', 
                              fontWeight: 'bold',
                              fontSize: '1rem',
                              py: 2
                            }}
                          >
                            Statut
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {autresFrais.map((nomfrais, index) => {
                          const paid = autresPayes.some((fraisPaye) =>
                            fraisPaye.toLowerCase().includes(nomfrais.toLowerCase())
                          );
                          
                          return (
                            <motion.tr key={index} custom={index} variants={tableRowVariants} initial="hidden" animate="visible"
                              whileHover={{ 
                                backgroundColor: '#f8fafc',
                                transition: { duration: 0.2 }
                              }}
                            >
                              <TableCell 
                                align="center" 
                                sx={{ 
                                  fontWeight: "600",
                                  fontSize: '0.95rem',
                                  py: 2,
                                  borderBottom: '1px solid #e2e8f0'
                                }}
                              >
                                {nomfrais}
                              </TableCell>
                              <TableCell 
                                align="center"
                                sx={{ 
                                  py: 2,
                                  borderBottom: '1px solid #e2e8f0'
                                }}
                              >
                                <StatusChip paid={paid} label={paid ? "Payé" : "Non payé"} />
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Résumé des frais payés */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-3 text-center"
                  >
                    <Typography variant="body2" className="text-gray-600">
                      {autresPayes.length > 0 ? (
                        <span>
                          ✅ <strong>{autresPayes.length}</strong> frais payés sur {autresFrais.length}
                        </span>
                      ) : (
                        <span className="text-red-500">
                          ❌ Aucun frais payé
                        </span>
                      )}
                    </Typography>
                  </motion.div>
                </motion.div>

                {/* Bouton Fermer */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="text-center"
                >
                  <motion.div
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                  >
                    <Button variant="contained" color="primary" onClick={handleClose} startIcon={<Close />}
                      sx={{ mt: 2, textTransform: 'none', borderRadius: 3, px: 4, py: 1, fontSize: '1rem', fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #4F46E5, #7E22CE)',
                        boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #4338CA, #6B21A8)',
                          boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)'
                        }
                      }}
                    >
                      Fermer la Carte
                    </Button>
                  </motion.div>
                </motion.div>
              </>
            )}
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}