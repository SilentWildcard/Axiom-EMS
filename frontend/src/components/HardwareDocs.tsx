import React, { useState } from 'react';
import { 
  BookOpen, 
  Cpu, 
  Radio, 
  Copy, 
  Check, 
  Globe, 
  Server,
  Code
} from 'lucide-react';

export const HardwareDocs: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const esp32CodeSnippet = `/*
 * ERS — ESP32 Roadside Unit (RSU) Node Firmware
 * Target: ESP32 NodeMCU + MAX98357A I2S Audio + P10 LED Matrix
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID     = "DELHI_TRAFFIC_POLICE_SECURE";
const char* WIFI_PASSWORD = "CHANGE_IN_PRODUCTION";
const char* ERS_ENDPOINT  = "https://ers-backend-delhi.onrender.com/api/iot/hardware/telemetry";
const char* DEVICE_ID     = "CP-RSU-01";
const char* AUTH_TOKEN    = "ers_rsu_token_delhi_sec_8f93a1";

void sendTelemetry() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(ERS_ENDPOINT);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["device_id"] = DEVICE_ID;
  doc["timestamp"] = String(millis());
  doc["token"] = AUTH_TOKEN;
  doc["rssi_dbm"] = WiFi.RSSI();
  doc["ambient_noise_db"] = 72.4;
  doc["traffic_queue_length_m"] = 45.0;

  String payload;
  serializeJson(doc, payload);
  int httpCode = http.POST(payload);

  if (httpCode == 200) {
    String response = http.getString();
    StaticJsonDocument<512> res;
    deserializeJson(res, response);

    const char* state = res["device_state"];
    bool speakerOn = res["speaker_active"];
    const char* displayCmd = res["display_command"];
    const char* audioCmd = res["audio_command"];

    // Trigger local actuators (Horn speaker & LED beacon)
    updateHardwareActuators(state, speakerOn, displayCmd, audioCmd);
  }
  http.end();
}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="flex items-center space-x-2.5">
          <span className="p-1.5 bg-[#2563EB]/15 text-[#2563EB] rounded-lg border border-[#2563EB]/40 shadow-[0_0_10px_rgba(82,123,255,0.25)]">
            <BookOpen className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold font-hud text-[#F0F7FF] tracking-wider">
            HARDWARE ARCHITECTURE & DEPLOYMENT SPECIFICATIONS
          </h1>
        </div>
        <p className="text-[#93B2D6] text-xs sm:text-sm mt-1">
          Complete physical integration guide for municipal traffic authorities, ESP32 microcontrollers, MQTT messaging, and cloud hosting.
        </p>
      </div>

      {/* Grid: 2 Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hardware Architecture Card */}
        <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E355B] pb-2">
            <h2 className="text-sm font-bold text-[#F0F7FF] flex items-center space-x-2 font-hud tracking-wider">
              <Cpu className="w-4 h-4 text-[#38BDF8]" />
              <span>ROADSIDE UNIT (RSU) HARDWARE BILL OF MATERIALS</span>
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-[#101E36] p-3 rounded-xl border border-[#1E355B] space-y-1">
              <span className="font-bold text-[#F0F7FF] font-mono">1. Microcontroller / Edge Gateway</span>
              <p className="text-[#93B2D6]">ESP32-WROOM-32D (240MHz dual-core, 520KB SRAM, hardware cryptographic accelerator) or Raspberry Pi Zero 2W.</p>
            </div>

            <div className="bg-[#101E36] p-3 rounded-xl border border-[#1E355B] space-y-1">
              <span className="font-bold text-[#F0F7FF] font-mono">2. Public Address Audio Subsystem</span>
              <p className="text-[#93B2D6]">MAX98357A I2S Class-D amplifier driving a 15W weatherproof horn speaker for clear voice warnings to queued drivers.</p>
            </div>

            <div className="bg-[#101E36] p-3 rounded-xl border border-[#1E355B] space-y-1">
              <span className="font-bold text-[#F0F7FF] font-mono">3. Dynamic Roadside Visual Strobe</span>
              <p className="text-[#93B2D6]">P10 32x16 RGB Outdoor LED Matrix displaying "EMERGENCY VEHICLE APPROACHING - CLEAR CENTER LANE".</p>
            </div>

            <div className="bg-[#101E36] p-3 rounded-xl border border-[#1E355B] space-y-1">
              <span className="font-bold text-[#F0F7FF] font-mono">4. Queue & Siren Sensors</span>
              <p className="text-[#93B2D6]">24GHz mmWave radar or ultrasonic rangefinder for queue length measurement; MAX4466 microphone for siren resonance confirmation.</p>
            </div>
          </div>
        </div>

        {/* MQTT Message Specification */}
        <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E355B] pb-2">
            <h2 className="text-sm font-bold text-[#F0F7FF] flex items-center space-x-2 font-hud tracking-wider">
              <Radio className="w-4 h-4 text-[#2563EB]" />
              <span>MQTT TELEMETRY & COMMAND TAXONOMY</span>
            </h2>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="bg-[#101E36] p-3 rounded-xl border border-[#1E355B] space-y-1">
              <span className="text-[#2563EB] font-bold">TOPIC: ers/delhi/rsu/&#123;device_id&#125;/telemetry</span>
              <p className="text-[#93B2D6] text-[11px] font-sans">Published by RSU every 2 seconds with authenticated token and queue length.</p>
            </div>

            <div className="bg-[#101E36] p-3 rounded-xl border border-[#1E355B] space-y-1">
              <span className="text-[#38BDF8] font-bold">TOPIC: ers/delhi/rsu/&#123;device_id&#125;/command</span>
              <p className="text-[#93B2D6] text-[11px] font-sans">Dispatched by ERS Server upon Stage 1 (&lt;650m) and Stage 2 (&lt;50m) events.</p>
            </div>

            <div className="bg-[#101E36] p-3 rounded-xl border border-[#1E355B] space-y-1">
              <span className="text-[#7DD3FC] font-bold">TOPIC: ers/delhi/ambulance/&#123;id&#125;/telemetry</span>
              <p className="text-[#93B2D6] text-[11px] font-sans">Published by ambulance Automatic Vehicle Location (AVL) GPS modem.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippet Viewer */}
      <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] space-y-3">
        <div className="flex items-center justify-between border-b border-[#1E355B] pb-2">
          <h2 className="text-sm font-bold text-[#F0F7FF] flex items-center space-x-2 font-hud tracking-wider">
            <Code className="w-4 h-4 text-[#38BDF8]" />
            <span>ESP32 ROADSIDE MICROCONTROLLER FIRMWARE (C++ / ARDUINO)</span>
          </h2>
          <button
            onClick={() => copyToClipboard(esp32CodeSnippet, 'esp32')}
            className="flex items-center space-x-1.5 px-3 py-1 bg-[#101E36] hover:bg-[#1E355B] text-[#38BDF8] border border-[#1E355B] hover:border-[#38BDF8]/50 rounded-lg text-xs font-mono transition shadow-sm"
          >
            {copiedSection === 'esp32' ? <Check className="w-3.5 h-3.5 text-[#7DD3FC]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'esp32' ? 'COPIED!' : 'COPY CODE'}</span>
          </button>
        </div>

        <pre className="bg-[#050B14] p-4 rounded-xl text-xs font-mono text-[#38BDF8] overflow-x-auto border border-[#1E355B] max-h-72 leading-relaxed shadow-inner">
          {esp32CodeSnippet}
        </pre>
      </div>

      {/* Deployment Instructions for Vercel and Backend */}
      <div className="bg-[#0B1528] border border-[#1E355B] rounded-xl p-5 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] space-y-4">
        <div className="flex items-center space-x-2 border-b border-[#1E355B] pb-2">
          <Globe className="w-4 h-4 text-[#7DD3FC]" />
          <h2 className="text-sm font-bold text-[#F0F7FF] font-hud tracking-wider">
            PRODUCTION DEPLOYMENT SPECIFICATIONS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-[#101E36] p-4 rounded-xl border border-[#1E355B] space-y-2">
            <div className="flex items-center space-x-2 text-[#F0F7FF] font-bold font-sans">
              <Globe className="w-4 h-4 text-[#38BDF8]" />
              <span>Frontend Deployment (Vercel)</span>
            </div>
            <p className="text-[#93B2D6] font-sans text-xs">
              The React + Vite + TypeScript application compiles to a fast, standalone static bundle with zero server-side node dependencies.
            </p>
            <pre className="bg-[#050B14] p-2.5 rounded-lg text-[11px] text-[#38BDF8] border border-[#1E355B]">
              cd frontend{"\n"}
              npm run build{"\n"}
              vercel --prod
            </pre>
            <p className="text-[11px] text-[#7DD3FC] font-sans">
              Includes unified client simulator fallback so 100% of features work seamlessly even if the backend is not yet attached!
            </p>
          </div>

          <div className="bg-[#101E36] p-4 rounded-xl border border-[#1E355B] space-y-2">
            <div className="flex items-center space-x-2 text-[#F0F7FF] font-bold font-sans">
              <Server className="w-4 h-4 text-[#2563EB]" />
              <span>Backend Deployment (Render / Railway / AWS)</span>
            </div>
            <p className="text-[#93B2D6] font-sans text-xs">
              FastAPI backend with Scikit-Learn ML engine, WebSockets, and CORS headers configured:
            </p>
            <pre className="bg-[#050B14] p-2.5 rounded-lg text-[11px] text-[#2563EB] border border-[#1E355B]">
              cd backend{"\n"}
              pip install -r requirements.txt{"\n"}
              uvicorn main:app --host 0.0.0.0 --port 8000
            </pre>
            <p className="text-[11px] text-[#93B2D6] font-sans">
              Set <code className="text-[#38BDF8]">VITE_API_URL</code> in frontend <code className="text-[#93B2D6]">.env</code> to point to live backend URL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
