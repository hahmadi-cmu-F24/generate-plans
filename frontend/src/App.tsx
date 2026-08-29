import { useMemo, useState } from "react";
import { api } from "./api";
import { ErrorBox } from "./components/ErrorBox";
import { PatientSection } from "./components/PatientSection";
import { ProviderSection } from "./components/ProviderSection";
import { OrderSection } from "./components/OrderSection";
import { ActionsSection } from "./components/ActionsSection";

type ApiError = { status: number; data: any };

function parseLines(s: string): string[] {
  return s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function App() {
  // Patient
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mrn, setMrn] = useState("");

  // Provider
  const [providerName, setProviderName] = useState("");
  const [npi, setNpi] = useState("");

  // Order
  const [medicationName, setMedicationName] = useState("");
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState("");
  const [additionalDxText, setAdditionalDxText] = useState("");
  const [medHistoryText, setMedHistoryText] = useState("");
  const [patientRecordsText, setPatientRecordsText] = useState("");

  // Workflow state
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const [patientId, setPatientId] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [carePlanId, setCarePlanId] = useState<string | null>(null);
  const [generator, setGenerator] = useState<string | null>(null);
  const [dob, setDob] = useState("");
  type PatientWarning = {
    code: string;
    message: string;
    existingPatientId?: string;
    existingMrn?: string;
  };

  const [patientWarning, setPatientWarning] = useState<PatientWarning | null>(null);
  
  const [patientRecordsFile, setPatientRecordsFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const additionalDiagnoses = useMemo(() => parseLines(additionalDxText), [additionalDxText]);
  const medicationHistory = useMemo(() => parseLines(medHistoryText), [medHistoryText]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const dobValid = /^\d{4}-\d{2}-\d{2}$/.test(dob) && dob <= todayStr;
  const recordsProvided = !!patientRecordsFile || patientRecordsText.trim().length > 0;

  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    mrn.trim() &&
    dobValid &&
    providerName.trim() &&
    npi.trim() &&
    medicationName.trim() &&
    primaryDiagnosis.trim() &&
    recordsProvided;

  async function handleCreateAll() {
    setError(null);
    setBusy(true);
    setPatientWarning(null); 
    setCarePlanId(null);
    setGenerator(null);
    setOrderId(null);
    setPatientId(null);
    setProviderId(null);

    try {
      const p = await api.createPatient({ firstName, lastName, mrn, dob });
      setPatientId(p.id);
      
      if (p.warning) setPatientWarning(p.warning);

      const pr = await api.createProvider({
        name: providerName.trim(),
        npi: npi.trim(),
      });
      setProviderId(pr.id);

      const o = await api.createOrder({
        patientId: p.id,
        providerId: pr.id,
        medicationName: medicationName.trim(),
        primaryDiagnosis: primaryDiagnosis.trim(),
        additionalDiagnoses,
        medicationHistory,
        patientRecordsText: patientRecordsText.trim(),
        patientRecordsFile,
      });
      setOrderId(o.id);
    } catch (e: any) {
      setError(e as ApiError);
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerateCarePlan() {
    if (!orderId) return;
    setError(null);
    setBusy(true);
    try {
      const r = await api.generateCarePlan(orderId);
      setCarePlanId(r.id);
      setGenerator(r.generator);
    } catch (e: any) {
      setError(e as ApiError);
    } finally {
      setBusy(false);
    }
  }

  function resetStatus() {
    setError(null);
    setBusy(false);
    setPatientWarning(null);
    setPatientId(null);
    setProviderId(null);
    setOrderId(null);
    setCarePlanId(null);
    setGenerator(null);

    // patient inputs
    setFirstName("");
    setLastName("");
    setMrn("");
    setDob("");

    // provider inputs
    setProviderName("");
    setNpi("");

    // order inputs
    setMedicationName("");
    setPrimaryDiagnosis("");
    setAdditionalDxText("");
    setMedHistoryText("");
    setPatientRecordsText("");
    setPatientRecordsFile(null);
    setFileInputKey((k) => k + 1);
  }

  return (
    <div className="container">
      <header className="header">
      (Preview Test)docker compose up -d
        <h1 style={{ margin: 0, fontSize: 26, letterSpacing: -0.2 }}>Care Plan Generator (P0 Webform)</h1>
        <div className="subtitle">
          Create a patient + provider + order, then generate and download a care plan.
        </div>
        <div className="badges">
          <span className="badge">400 = validation</span>
          <span className="badge">409 = duplicate / conflict</span>
          <span className="badge">Download = .txt</span>
        </div>
      </header>

      <ErrorBox title="Request error" error={error} />

      {patientWarning ? (
        <div className="warnBox" role="alert">
          <div className="warnTop">
            <div className="warnTitle">Potential duplicate patient</div>
            <button className="warnClose" onClick={() => setPatientWarning(null)} aria-label="Dismiss warning">
              ×
            </button>
          </div>
          <div className="warnBody">
            {patientWarning.message}
            {patientWarning.existingMrn ? (
              <>
                {" "}
                Existing MRN: <span className="mono">{patientWarning.existingMrn}</span>.
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid">
        <PatientSection
          firstName={firstName}
          lastName={lastName}
          mrn={mrn}
          dob={dob}
          setFirstName={setFirstName}
          setLastName={setLastName}
          setMrn={setMrn}
          setDob={setDob}
          patientId={patientId}
        />

        <ProviderSection
          providerName={providerName}
          npi={npi}
          setProviderName={setProviderName}
          setNpi={setNpi}
          providerId={providerId}
        />

        <OrderSection
          medicationName={medicationName}
          primaryDiagnosis={primaryDiagnosis}
          additionalDxText={additionalDxText}
          medHistoryText={medHistoryText}
          patientRecordsText={patientRecordsText}
          patientRecordsFile={patientRecordsFile}
          fileInputKey={fileInputKey}
          setMedicationName={setMedicationName}
          setPrimaryDiagnosis={setPrimaryDiagnosis}
          setAdditionalDxText={setAdditionalDxText}
          setMedHistoryText={setMedHistoryText}
          setPatientRecordsText={setPatientRecordsText}
          orderId={orderId}
          setPatientRecordsFile={setPatientRecordsFile}
        />

        <ActionsSection
          busy={busy}
          canSubmit={!!canSubmit}
          orderId={orderId}
          carePlanId={carePlanId}
          generator={generator}
          onCreateAll={handleCreateAll}
          onGenerate={handleGenerateCarePlan}
          onReset={resetStatus}
        />

        <footer className="footer">
          Backend must be running on <code>http://localhost:3001</code> and CORS enabled for{" "}
          <code>http://localhost:5173</code>.
        </footer>
      </div>
    </div>
  );
}
