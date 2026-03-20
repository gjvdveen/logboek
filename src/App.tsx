import { useState, useMemo, useEffect } from 'react';
import { getFileBlob } from './utils/fileStore';
import { useLogbook }   from './hooks/useLogbook';
import { useFuelLog }   from './hooks/useFuelLog';
import { useRepairLog } from './hooks/useRepairLog';
import { useCrewList }  from './hooks/useCrewList';
import { useDayLog }    from './hooks/useDayLog';
import { useReizen }        from './hooks/useReizen';
import { useSeizoenStarts } from './hooks/useSeizoenStarts';
import { useBootData }      from './hooks/useBootData';
import { getLastEngineHours } from './utils/engineHours';
import { getRecentPorts }    from './utils/ports';
import { useTranslation } from './i18n';

import TripList    from './components/TripList';
import TripForm    from './components/TripForm';
import TripDetail  from './components/TripDetail';

import FuelForm   from './components/FuelForm';
import FuelDetail from './components/FuelDetail';

import ExploitatieLog from './components/ExploitatieLog';
import RepairForm     from './components/RepairForm';
import RepairDetail   from './components/RepairDetail';

import CrewList from './components/CrewList';
import CrewForm from './components/CrewForm';


import ReisList   from './components/ReisList';
import ReisForm   from './components/ReisForm';
import ReisDetail from './components/ReisDetail';

import StatsOverview from './components/StatsOverview';

import SeizoenList   from './components/SeizoenList';
import SeizoenForm   from './components/SeizoenForm';
import SeizoenDetail from './components/SeizoenDetail';

import BootForm from './components/BootForm';
import MaintenanceList from './components/MaintenanceList';
import MaintenanceForm from './components/MaintenanceForm';

import { useMaintenanceLog } from './hooks/useMaintenanceLog';

import type { TripFormData, FuelFormData, RepairFormData, CrewFormData, ReisFormData, SeizoenStartFormData, MaintenanceFormData } from './types';
import { loadDemoData, restoreRealData, clearAllData, isDemoActive } from './utils/demoData';
import { exportData, importData } from './utils/backupData';

type Section          = 'reizen' | 'trips' | 'crew' | 'repairs' | 'stats' | 'settings';
type View             = 'list' | 'pick' | 'form' | 'detail';
type SettingsTab      = 'boot' | 'crew' | 'seizoen' | 'onderhoud';

function sortFuelByHours(entries: ReturnType<typeof useFuelLog>['entries']) {
  return [...entries].sort((a, b) => {
    const ha = parseFloat(a.engineHours), hb = parseFloat(b.engineHours);
    if (!isNaN(ha) && !isNaN(hb)) return ha - hb;
    return a.date.localeCompare(b.date);
  });
}

function lastTrip(trips: ReturnType<typeof useLogbook>['trips']) {
  return [...trips].sort((a, b) =>
    (b.departureDate + b.departureTime).localeCompare(a.departureDate + a.departureTime)
  )[0] ?? null;
}

export default function App() {
  const { t, lang, setLang } = useTranslation();
  const { trips,          addTrip,    updateTrip,    deleteTrip    } = useLogbook();
  const { entries: fuelEntries,   addEntry: addFuel,    updateEntry: updateFuel,   deleteEntry: deleteFuel   } = useFuelLog();
  const { entries: repairEntries, addEntry: addRepair,  updateEntry: updateRepair, deleteEntry: deleteRepair } = useRepairLog();
  const { members,        addMember,  updateMember,  deleteMember  } = useCrewList();
  const { entries: dayLogs } = useDayLog();
  const { reizen, addReis, updateReis, deleteReis } = useReizen();
  const { seizoenStarts, addSeizoenStart, updateSeizoenStart, deleteSeizoenStart } = useSeizoenStarts();
  const { bootData, saveBootData } = useBootData();
  const { tasks: maintTasks, addTask: addMaint, updateTask: updateMaint,
          deleteTask: deleteMaint, markDone: markMaintDone } = useMaintenanceLog();
  const [importError, setImportError] = useState('');

  const [section,           setSection]          = useState<Section>('trips');
  const [view,              setView]             = useState<View>('list');
  const [selectedId,        setSelectedId]       = useState<string | null>(null);
  const [settingsTab,       setSettingsTab]      = useState<SettingsTab>('boot');
  const [exploitatieKind,   setExploitatieKind]  = useState<'repair' | 'fuel'>('repair');
  const [bannerUrl,         setBannerUrl]        = useState<string>('');

  useEffect(() => {
    if (bootData.bannerImageId) {
      getFileBlob(bootData.bannerImageId).then(blob => {
        if (!blob) return;
        const reader = new FileReader();
        reader.onload = () => setBannerUrl(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } else {
      setBannerUrl('');
    }
  }, [bootData.bannerImageId]);

  // For pre-selecting a reis when adding a new trip from ReisDetail
  const [presetReisId, setPresetReisId] = useState('');

  function goSection(s: Section) { setSection(s); setView('list'); setSelectedId(null); }
  function goSettingsTab(tab: SettingsTab) { setSettingsTab(tab); setView('list'); setSelectedId(null); }
  function goNew()                { setSelectedId(null); setView('form'); }
  function goView(id: string)     { setSelectedId(id);   setView('detail'); }
  function goEdit(id: string)     { setSelectedId(id);   setView('form'); }
  function goBack()               { setView('list');  setSelectedId(null); }

  /* ── Engine hours ── */
  const lastEngineHours = useMemo(() => getLastEngineHours(
    trips, fuelEntries, repairEntries,
    selectedId && view === 'form'
      ? { type: section === 'trips' ? 'trip' : (section === 'repairs' && exploitatieKind === 'fuel') ? 'fuel' : 'repair', id: selectedId }
      : undefined,
  ), [trips, fuelEntries, repairEntries, section, exploitatieKind, selectedId, view]);

  /* ── Trip defaults for new trips ── */
  const prevTrip       = useMemo(() => lastTrip(trips), [trips]);
  const defaultFrom    = prevTrip?.to ?? '';
  const defaultCrewIds = useMemo(() => {
    if (presetReisId) {
      const reis = reizen.find(r => r.id === presetReisId);
      if (reis?.crewIds?.length) return reis.crewIds;
    }
    return prevTrip?.crewIds ?? [];
  }, [presetReisId, reizen, prevTrip]);

  const recentPorts = useMemo(() => getRecentPorts(trips), [trips]);

  const prevTempCrew = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    [...trips].sort((a, b) => b.departureDate.localeCompare(a.departureDate))
      .forEach(tr => (tr.tempCrew ?? []).forEach(n => { if (!seen.has(n)) { seen.add(n); list.push(n); } }));
    return list;
  }, [trips]);

  const defaultDepartureDate = useMemo(() => {
    const base = prevTrip?.arrivalDate || prevTrip?.departureDate;
    if (!base) return new Date().toISOString().split('T')[0];
    const d = new Date(base + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, [prevTrip]);

  /* ── Repair suppliers ── */
  const recentSuppliers = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    [...repairEntries]
      .sort((a, b) => b.date.localeCompare(a.date))
      .forEach(e => {
        const s = e.supplier?.trim();
        if (s && !seen.has(s)) { seen.add(s); list.push(s); }
      });
    return list;
  }, [repairEntries]);

  /* ── Trip handlers ── */
  const selectedTrip = selectedId ? (trips.find(tr => tr.id === selectedId) ?? null) : null;

  function handleSaveTrip(data: TripFormData) {
    if (selectedId) updateTrip(selectedId, data); else addTrip(data);
    setPresetReisId('');
    goBack();
  }
  function handleDeleteTrip(id: string) { deleteTrip(id); goBack(); }

  /* ── Fuel handlers ── */
  const fuelSorted   = sortFuelByHours(fuelEntries);
  const selectedFuel = selectedId ? (fuelEntries.find(e => e.id === selectedId) ?? null) : null;
  const prevFuel     = selectedFuel
    ? (fuelSorted[fuelSorted.findIndex(e => e.id === selectedId) - 1] ?? null)
    : null;

  function handleSaveFuel(data: FuelFormData) {
    if (selectedId) updateFuel(selectedId, data); else addFuel(data);
    goBack();
  }
  function handleDeleteFuel(id: string) { deleteFuel(id); goBack(); }

  /* ── Repair handlers ── */
  const selectedRepair = selectedId ? (repairEntries.find(e => e.id === selectedId) ?? null) : null;

  function handleSaveRepair(data: RepairFormData) {
    if (selectedId) updateRepair(selectedId, data); else addRepair(data);
    goBack();
  }
  function handleDeleteRepair(id: string) { deleteRepair(id); goBack(); }

  /* ── Crew handlers ── */
  const selectedMember = selectedId ? (members.find(m => m.id === selectedId) ?? null) : null;

  function handleSaveCrew(data: CrewFormData) {
    if (selectedId) updateMember(selectedId, data); else addMember(data);
    goBack();
  }
  function handleDeleteCrew(id: string) { deleteMember(id); goBack(); }

  /* ── Reis handlers ── */
  const selectedReis = selectedId ? (reizen.find(r => r.id === selectedId) ?? null) : null;

  function handleSaveReis(data: ReisFormData) {
    if (selectedId) updateReis(selectedId, data); else addReis(data);
    goBack();
  }
  function handleDeleteReis(id: string) {
    // Unlink all trips from this reis
    trips.filter(tr => tr.reisId === id).forEach(tr => updateTrip(tr.id, { ...tr, reisId: '' }));
    deleteReis(id);
    goBack();
  }

  function goAddTripForReis(reisId: string) {
    setPresetReisId(reisId);
    setSection('trips');
    setSelectedId(null);
    setView('form');
  }

  function goViewTripFromReis(tripId: string) {
    setSection('trips');
    setSelectedId(tripId);
    setView('detail');
  }

  /* ── Seizoen handlers ── */
  const selectedSeizoen = selectedId ? (seizoenStarts.find(s => s.id === selectedId) ?? null) : null;

  function handleSaveSeizoen(data: SeizoenStartFormData) {
    if (selectedId) updateSeizoenStart(selectedId, data); else addSeizoenStart(data);
    goBack();
  }
  function handleDeleteSeizoen(id: string) {
    deleteSeizoenStart(id);
    goBack();
  }

  /* ── Maintenance handlers ── */
  const selectedMaint = selectedId ? (maintTasks.find(t => t.id === selectedId) ?? null) : null;

  function handleSaveMaint(data: MaintenanceFormData) {
    if (selectedId) updateMaint(selectedId, data); else addMaint(data);
    goBack();
  }

  /* ── Backup import handler ── */
  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm(t('backup.confirm.import'))) { e.target.value = ''; return; }
    importData(file)
      .then(() => window.location.reload())
      .catch(err => { setImportError(err.message); e.target.value = ''; });
  }

  const addLabels: Partial<Record<Section, string>> = {
    reizen: t('nav.add.reis'),
    trips:  t('nav.add.trip'),
  };

  // In settings: add-button only for crew, seizoen and onderhoud sub-tabs
  const settingsAddLabel: Partial<Record<SettingsTab, string>> = {
    crew:     t('nav.add.crew'),
    seizoen:  t('nav.add.seizoen'),
    onderhoud: t('maint.add'),
  };

  return (
    <div>
      <header className="header">
        <div className="header-brand">
          <span className="header-icon">⚓</span>
          <div>
            <div className="header-title">{bootData.naam || t('app.subtitle')}</div>
            {bootData.naam && <div className="header-subtitle">{t('app.subtitle')}</div>}
          </div>
        </div>
        <button className="lang-toggle" onClick={() => setLang(lang === 'nl' ? 'en' : 'nl')}>
          {lang === 'nl' ? '🇬🇧' : '🇳🇱'}
        </button>
        {view === 'list' && section === 'repairs' && (
          <button className="btn btn-primary btn-add" onClick={() => setView('pick')}><span className="btn-add-text">{t('nav.add.repair')}</span></button>
        )}
        {view === 'list' && section !== 'settings' && section !== 'repairs' && addLabels[section] && (
          <button className="btn btn-primary btn-add" onClick={goNew}><span className="btn-add-text">{addLabels[section]}</span></button>
        )}
        {view === 'list' && section === 'settings' && settingsAddLabel[settingsTab] && (
          <button className="btn btn-primary btn-add" onClick={goNew}><span className="btn-add-text">{settingsAddLabel[settingsTab]}</span></button>
        )}
      </header>

      {view === 'list' && (
        <div className="hero" style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}>
          <div className="hero-overlay" />
          <div className="hero-content">
            {bootData.naam && <div className="hero-name">{bootData.naam}</div>}
            {bootData.type && <div className="hero-tagline">{bootData.type}</div>}
          </div>
        </div>
      )}

      <nav className="tab-bar">
        <button className={`tab${section === 'reizen'   ? ' tab-active' : ''}`} onClick={() => goSection('reizen')}><span className="tab-icon">⛵</span><span className="tab-text">{t('nav.reizen')}</span></button>
        <button className={`tab${section === 'trips'    ? ' tab-active' : ''}`} onClick={() => goSection('trips')}><span className="tab-icon">🧭</span><span className="tab-text">{t('nav.trips')}</span></button>
        <button className={`tab${section === 'repairs'  ? ' tab-active' : ''}`} onClick={() => goSection('repairs')}><span className="tab-icon">💶</span><span className="tab-text">{t('nav.repairs')}</span></button>
        <button className={`tab${section === 'stats'    ? ' tab-active' : ''}`} onClick={() => goSection('stats')}><span className="tab-icon">📊</span><span className="tab-text">{t('nav.stats')}</span></button>
        <button className={`tab${section === 'settings' ? ' tab-active' : ''}`} onClick={() => goSection('settings')}><span className="tab-icon">⚙️</span><span className="tab-text">{t('nav.settings')}</span></button>
      </nav>

      <main className="main">

        {/* Trips */}
        {section === 'trips' && view === 'list' && (
          <TripList trips={trips} reizen={reizen} onView={goView} onNew={goNew} />
        )}
        {section === 'trips' && view === 'form' && (
          <TripForm
            trip={selectedTrip}
            lastEngineHours={lastEngineHours}
            defaultFrom={defaultFrom}
            defaultDepartureDate={defaultDepartureDate}
            recentPorts={recentPorts}
            defaultCrewIds={defaultCrewIds}
            defaultReisId={presetReisId}
            crewMembers={members}
            reizen={reizen}
            prevTempCrew={prevTempCrew}
            onSave={handleSaveTrip}
            onCancel={() => { setPresetReisId(''); goBack(); }}
          />
        )}
        {section === 'trips' && view === 'detail' && selectedTrip && (
          <TripDetail
            trip={selectedTrip}
            crewMembers={members}
            onEdit={() => goEdit(selectedTrip.id)}
            onDelete={() => handleDeleteTrip(selectedTrip.id)}
            onBack={goBack}
          />
        )}

        {/* Exploitatiekosten (repairs + fuel combined) */}
        {section === 'repairs' && view === 'list' && (
          <ExploitatieLog
            repairEntries={repairEntries}
            fuelEntries={fuelEntries}
            onViewRepair={id => { setExploitatieKind('repair'); goView(id); }}
            onViewFuel={id   => { setExploitatieKind('fuel');   goView(id); }}
            onNew={() => setView('pick')}
          />
        )}
        {section === 'repairs' && view === 'pick' && (
          <div className="exploitatie-pick">
            <div className="exploitatie-pick-title">{t('exploitatie.pick.title')}</div>
            <div className="exploitatie-pick-grid">
              <button className="exploitatie-pick-card" onClick={() => { setExploitatieKind('repair'); goNew(); }}>
                <div className="exploitatie-pick-icon">🔧</div>
                <div className="exploitatie-pick-label">{t('exploitatie.pick.repair')}</div>
                <div className="exploitatie-pick-desc">{t('exploitatie.pick.repair.desc')}</div>
              </button>
              <button className="exploitatie-pick-card" onClick={() => { setExploitatieKind('fuel'); goNew(); }}>
                <div className="exploitatie-pick-icon">⛽</div>
                <div className="exploitatie-pick-label">{t('exploitatie.pick.fuel')}</div>
                <div className="exploitatie-pick-desc">{t('exploitatie.pick.fuel.desc')}</div>
              </button>
            </div>
            <button className="btn btn-secondary" style={{ marginTop: '16px' }} onClick={goBack}>{t('btn.back')}</button>
          </div>
        )}
        {section === 'repairs' && view === 'form' && exploitatieKind === 'repair' && (
          <RepairForm entry={selectedRepair} lastEngineHours={lastEngineHours}
            suppliers={recentSuppliers} onSave={handleSaveRepair} onCancel={goBack} />
        )}
        {section === 'repairs' && view === 'form' && exploitatieKind === 'fuel' && (
          <FuelForm entry={selectedFuel} lastEngineHours={lastEngineHours} onSave={handleSaveFuel} onCancel={goBack} />
        )}
        {section === 'repairs' && view === 'detail' && exploitatieKind === 'repair' && selectedRepair && (
          <RepairDetail entry={selectedRepair}
            onEdit={() => goEdit(selectedRepair.id)}
            onDelete={() => handleDeleteRepair(selectedRepair.id)}
            onBack={goBack} />
        )}
        {section === 'repairs' && view === 'detail' && exploitatieKind === 'fuel' && selectedFuel && (
          <FuelDetail entry={selectedFuel} prevEntry={prevFuel}
            onEdit={() => goEdit(selectedFuel.id)}
            onDelete={() => handleDeleteFuel(selectedFuel.id)}
            onBack={goBack} />
        )}

        {/* Reizen */}
        {section === 'reizen' && view === 'list' && (
          <ReisList reizen={reizen} trips={trips}
            onView={goView} onViewTrip={goViewTripFromReis} onNew={goNew} />
        )}
        {section === 'reizen' && view === 'form' && (
          <ReisForm reis={selectedReis} crewMembers={members} onSave={handleSaveReis} onCancel={goBack} />
        )}
        {section === 'reizen' && view === 'detail' && selectedReis && (
          <ReisDetail
            reis={selectedReis}
            trips={trips}
            onEdit={() => goEdit(selectedReis.id)}
            onDelete={() => handleDeleteReis(selectedReis.id)}
            onBack={goBack}
            onViewTrip={goViewTripFromReis}
            onAddTrip={() => goAddTripForReis(selectedReis.id)}
          />
        )}

        {/* Stats */}
        {section === 'stats' && (
          <StatsOverview trips={trips} fuelEntries={fuelEntries} repairEntries={repairEntries} dayLogs={dayLogs} reizen={reizen} bootNaam={bootData.naam} bootType={bootData.type} bannerUrl={bannerUrl} />
        )}

        {/* Instellingen */}
        {section === 'settings' && (
          <div>
            {/* Sub-navigatie */}
            {view === 'list' && (
              <div className="settings-subnav">
                <button className={`settings-tab${settingsTab === 'boot'     ? ' settings-tab-active' : ''}`} onClick={() => goSettingsTab('boot')}>{t('settings.boot')}</button>
                <button className={`settings-tab${settingsTab === 'crew'     ? ' settings-tab-active' : ''}`} onClick={() => goSettingsTab('crew')}>{t('settings.crew')}</button>
                <button className={`settings-tab${settingsTab === 'seizoen'  ? ' settings-tab-active' : ''}`} onClick={() => goSettingsTab('seizoen')}>{t('settings.seizoen')}</button>
                <button className={`settings-tab${settingsTab === 'onderhoud'? ' settings-tab-active' : ''}`} onClick={() => goSettingsTab('onderhoud')}>{t('maint.tab')}</button>
              </div>
            )}

            {/* Boot gegevens */}
            {settingsTab === 'boot' && (
              <>
                <BootForm data={bootData} onSave={saveBootData} />

                {/* Backup */}
                <div className="demo-section">
                  <div className="demo-section-title">{t('backup.title')}</div>
                  <p className="demo-section-desc">{t('backup.desc')}</p>
                  {importError && <p className="error-msg" style={{ marginBottom: 8 }}>{importError}</p>}
                  <div className="demo-section-actions">
                    <button className="btn btn-secondary" onClick={exportData}>{t('backup.btn.export')}</button>
                    <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                      {t('backup.btn.import')}
                      <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
                    </label>
                  </div>
                </div>

                {/* Demo */}
                <div className="demo-section">
                  <div className="demo-section-title">{t('demo.title')}</div>
                  <p className="demo-section-desc">{isDemoActive() ? t('demo.desc.active') : t('demo.desc')}</p>
                  <div className="demo-section-actions">
                    {isDemoActive() ? (
                      <button className="btn btn-primary" onClick={() => {
                        if (window.confirm(t('demo.confirm.restore'))) restoreRealData();
                      }}>{t('demo.btn.restore')}</button>
                    ) : (
                      <button className="btn btn-secondary" onClick={() => {
                        if (window.confirm(t('demo.confirm.load'))) loadDemoData();
                      }}>{t('demo.btn.load')}</button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => {
                      if (window.confirm(t('demo.confirm.clear'))) clearAllData();
                    }}>{t('demo.btn.clear')}</button>
                  </div>
                </div>
              </>
            )}

            {/* Bemanning */}
            {settingsTab === 'crew' && view === 'list' && (
              <CrewList members={members} onEdit={goEdit} onDelete={handleDeleteCrew} onNew={goNew} />
            )}
            {settingsTab === 'crew' && view === 'form' && (
              <CrewForm member={selectedMember} onSave={handleSaveCrew} onCancel={goBack} />
            )}

            {/* Seizoensstarts */}
            {settingsTab === 'seizoen' && view === 'list' && (
              <SeizoenList seizoenStarts={seizoenStarts} onView={goView} onNew={goNew} />
            )}
            {settingsTab === 'seizoen' && view === 'form' && (
              <SeizoenForm entry={selectedSeizoen} onSave={handleSaveSeizoen} onCancel={goBack} />
            )}
            {settingsTab === 'seizoen' && view === 'detail' && selectedSeizoen && (
              <SeizoenDetail
                entry={selectedSeizoen}
                onEdit={() => goEdit(selectedSeizoen.id)}
                onDelete={() => handleDeleteSeizoen(selectedSeizoen.id)}
                onBack={goBack}
              />
            )}

            {/* Onderhoud */}
            {settingsTab === 'onderhoud' && view === 'list' && (
              <MaintenanceList
                tasks={maintTasks}
                currentEngineHours={lastEngineHours ?? 0}
                onEdit={goEdit}
                onDelete={deleteMaint}
                onMarkDone={id => markMaintDone(id, (lastEngineHours ?? 0) > 0 ? String(Math.round(lastEngineHours ?? 0)) : '')}
                onNew={goNew}
              />
            )}
            {settingsTab === 'onderhoud' && view === 'form' && (
              <MaintenanceForm
                task={selectedMaint}
                currentEngineHours={lastEngineHours ?? 0}
                onSave={handleSaveMaint}
                onCancel={goBack}
              />
            )}
          </div>
        )}

      </main>
    </div>
  );
}
