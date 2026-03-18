import React, { useState, useMemo } from "react";
import {
  FaGraduationCap, FaCalendarAlt, FaEye, FaEdit, FaTrash,
  FaIdCard, FaSchool, FaBookOpen,
} from "react-icons/fa";
import { ChevronDown, Users } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Groupe les élèves : annee → niveau/classe → liste
 */
const groupByAnneeAndClasse = (eleves) => {
  const grouped = {};
  eleves.forEach((e) => {
    const annee  = e.inscription?.anneesco || "Année inconnue";
    const niveau = e.niveau?.nomniveau     || "Sans classe";
    if (!grouped[annee])         grouped[annee] = {};
    if (!grouped[annee][niveau]) grouped[annee][niveau] = [];
    grouped[annee][niveau].push(e);
  });
  // Trier les années décroissant
  return Object.fromEntries(
    Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a))
  );
};

// ─── Badge ────────────────────────────────────────────────────────────────────
const CountBadge = ({ count}) => (
  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border">
    <Users size={10} />
    {count} élève{count > 1 ? "s" : ""}
  </span>
);

// ─── Ligne élève — design identique à AffichageEleve ─────────────────────────
const EleveRow = ({ e, onDetails, onCarte, onEdit, onDelete, onPhotoClick }) => {
  const pers = e.inscription?.personne;
  return (
    <tr>
      <td className="px-2 py-2 text-center text-sm">{pers?.matricule}</td>
      <td className="px-2 py-2 text-center font-medium">
        <b>{pers?.nom}</b> {pers?.prenom}
      </td>
      <td className="px-2 py-2 text-center text-sm">
        {pers?.naiss}{pers?.lieunaiss ? ` à ${pers.lieunaiss}` : ""}
      </td>
      <td className="px-2 py-2 text-center">
        {pers?.photo ? (
          <img
            src={`https://fma-inscription.onrender.com/storage/${pers.photo}`}
            alt="photo"
            className="w-10 h-10 rounded-full mx-auto cursor-pointer border-2 border-indigo-500 object-cover"
            onClick={() => onPhotoClick(`https://fma-inscription.onrender.com/storage/${pers.photo}`)}
          />
        ) : (
          <span className="text-gray-400 text-sm">Aucune</span>
        )}
      </td>
      <td className="px-2 py-2 text-center text-sm">{pers?.cin || "Mineur"}</td>
      <td className="px-2 py-2 text-center text-sm font-semibold text-indigo-600">
        {e.niveau?.nomniveau || "---"}
      </td>
      <td className="px-2 py-2 text-center">
        <div className="flex justify-center gap-1">
          <button
            onClick={() => onCarte(e)}
            className="flex items-center h-8 text-white bg-blue-600 p-1 rounded text-xs hover:bg-blue-700"
          >
            <FaIdCard className="mx-1 w-3 h-3" /> Carte
          </button>
          <button
            onClick={() => onDetails(e)}
            className="flex items-center h-8 text-white bg-green-600 p-1 rounded text-xs hover:bg-green-700"
          >
            <FaEye className="mx-1 w-3 h-3" /> Détails
          </button>
          <button
            onClick={() => onEdit(e)}
            className="flex items-center h-8 text-white bg-indigo-600 p-1 rounded text-xs hover:bg-indigo-700"
          >
            <FaEdit className="mx-1 w-3 h-3" /> Modifier
          </button>
          <button
            onClick={() => onDelete(e)}
            className="flex items-center h-8 text-white bg-red-600 p-1 rounded text-xs hover:bg-red-700"
          >
            <FaTrash className="mx-1 w-3 h-3" /> Supprimer
          </button>
        </div>
      </td>
    </tr>
  );
};

// ─── Accordéon classe/niveau (niveau 2) ───────────────────────────────────────
const ClasseAccordion = ({
  nomClasse, eleves, onDetails, onCarte, onEdit, onDelete, onPhotoClick,
  searchQuery
}) => {
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return eleves;
    const q = searchQuery.toLowerCase();
    return eleves.filter(e => {
      const pers = e.inscription?.personne;
      return (
        pers?.matricule?.toLowerCase().includes(q) ||
        pers?.nom?.toLowerCase().includes(q) ||
        pers?.prenom?.toLowerCase().includes(q) ||
        pers?.cin?.toLowerCase().includes(q) ||
        String(e.no_inscrit || "").toLowerCase().includes(q)
      );
    });
  }, [eleves, searchQuery]);

  if (filtered.length === 0 && searchQuery.trim()) return null;

  return (
    <div className="rounded-xl border overflow-hidden transition-all duration-200">
      {/* Header classe */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors bg-indigo-100">
            <FaSchool size={12} className="text-indigo-500" />
          </div>
          <span className="font-semibold text-sm ">
            {nomClasse}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CountBadge count={filtered.length} />
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${open ? "rotate-180" : ""} `}/>
        </div>
      </button>

      {/* Tableau élèves */}
      {open && (
        <div className="border-t overflow-x-auto">
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="table table-hover table-striped w-full">
              <thead className="sticky top-0 bg-indigo-600">
                <tr>
                  <th className="px-4 py-2 text-center font-bold w-auto">N° Matricule</th>
                  <th className="px-4 py-2 text-center font-bold w-auto">Noms & Prénom(s)</th>
                  <th className="px-4 py-2 text-center font-bold w-auto">Date et Lieu de Naissance</th>
                  <th className="px-4 py-2 text-center font-bold w-auto">Photo d'identité</th>
                  <th className="px-4 py-2 text-center font-bold w-auto">CIN</th>
                  <th className="px-4 py-2 text-center font-bold w-auto">Classe</th>
                  <th className="px-4 py-2 text-center font-bold w-auto">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length > 0 ? (
                  filtered.map((e, i) => (
                    <EleveRow
                      key={e.no_inscrit || i}
                      e={e}
                      onDetails={onDetails}
                      onCarte={onCarte}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onPhotoClick={onPhotoClick}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">
                      <FaBookOpen className="mx-auto mb-2" size={20} />
                      Aucun élève trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Accordéon année (niveau 1) ───────────────────────────────────────────────
const AnneeAccordion = ({
  annee, classes, onDetails, onCarte, onEdit, onDelete, onPhotoClick,
  searchQuery,
}) => {
  const [open, setOpen] = useState(false);

  const isSearching  = searchQuery.trim().length > 0;
  const isOpen       = isSearching || open;

  return (
    <div className="rounded-2xl border-2 overflow-hidden transition-all duration-300">
      {/* ── En-tête année ── */}
      <button
        onClick={() => !isSearching && setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all">
            <FaCalendarAlt size={15}/>
          </div>

          <div>
            <p className="text-base font-bold">
              Année scolaire {annee}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isSearching && (
            <ChevronDown
              size={30} 
              className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            />
          )}
        </div>
      </button>

      {/* ── Contenu classes ── */}
      {isOpen && (
        <div className="px-4 py-4 space-y-3 border-t">
          {Object.entries(classes)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([nomClasse, eleves]) => (
              <ClasseAccordion
                key={nomClasse}
                nomClasse={nomClasse}
                eleves={eleves}
                onDetails={onDetails}
                onCarte={onCarte}
                onEdit={onEdit}
                onDelete={onDelete}
                onPhotoClick={onPhotoClick}
                searchQuery={searchQuery}
              />
            ))}
        </div>
      )}
    </div>
  );
};

// ─── Composant principal exporté ──────────────────────────────────────────────
export default function ListeEleves({
  eleves = [],
  onDetails,
  onCarte,
  onEdit,
  onDelete,
  onPhotoClick,
}) {

  const [searchQuery, setSearchQuery] = useState("");

  const grouped = useMemo(() => groupByAnneeAndClasse(eleves), [eleves]);

  return (
    <div>
      {/* ── Accordéon ── */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 ">
          <FaGraduationCap size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucune donnée à afficher</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(grouped).map(([annee, classes]) => (
            <AnneeAccordion
              key={annee}
              annee={annee}
              classes={classes}
              onDetails={onDetails}
              onCarte={onCarte}
              onEdit={onEdit}
              onDelete={onDelete}
              onPhotoClick={onPhotoClick}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}
