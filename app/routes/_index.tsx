import { Call, CallAgent, IncomingCall } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import { useEffect, useState } from "react";

async function initCallAgent() {
  const AzureCommunicationCallingModule = await import(
    "@azure/communication-calling"
  );
  const { CallClient } = AzureCommunicationCallingModule;
  const callClient = new CallClient();
  return callClient;
}

export default function CommsTest() {
  const [token, setToken] = useState(
    "eyJhbGciOiJSUzI1NiIsImtpZCI6IjYwNUVCMzFEMzBBMjBEQkRBNTMxODU2MkM4QTM2RDFCMzIyMkE2MTkiLCJ4NXQiOiJZRjZ6SFRDaURiMmxNWVZpeUtOdEd6SWlwaGsiLCJ0eXAiOiJKV1QifQ.eyJza3lwZWlkIjoiYWNzOjFmODdmZThjLThjYTgtNDhkNi1iYjk0LWY0MzE1OGJmNmMwY18wMDAwMDAyMS0zZGVjLWRhYTktYmRkMC00NDQ4MjIwMDBlN2IiLCJzY3AiOjE3OTIsImNzaSI6IjE3MjA2Mzg0NTMiLCJleHAiOjE3MjA3MjQ4NTMsInJnbiI6ImFtZXIiLCJhY3NTY29wZSI6InZvaXAiLCJyZXNvdXJjZUlkIjoiMWY4N2ZlOGMtOGNhOC00OGQ2LWJiOTQtZjQzMTU4YmY2YzBjIiwicmVzb3VyY2VMb2NhdGlvbiI6InVuaXRlZHN0YXRlcyIsImlhdCI6MTcyMDYzODQ1M30.Deas6Yd_Bwdvck3x8dCgHno7NY_AiyJp6cjWlm8yRcVEcrxo38wmm1qgeR78n-2Y5chEEc_LUVlEKp7bN3UTPdjAaxl9_FiAnWoGaCNpPTT1k-7kTclhWOsPF1hlTwe2rdRV3c1Uazf_R81kqliBPUG3ZUBV58UDQ_gEYae_dMu5WKZZDZsrk1onaCNurBFPJdIlJAIm_FfKBMCTOZ-HY6dO_xckFTAdYeEHlryIQsrLyDH57NlHLUAICf0VSdnZx7sJ50X1jtJQzaPwPT-smpqxLohjugltGiiQqM4-bhwEUVp53t9xeRpIKC0FxhBaIS3jv4U3F8ypeh9OpTZu9Q",
  );
  const [calleeId, setCalleeId] = useState("8:echo123");
  const [callAgent, setCallAgent] = useState<CallAgent>();
  const [incomingCall, setIncomingCall] = useState<IncomingCall>();
  const [call, setCall] = useState<Call>();

  useEffect(() => {
    if (!callAgent) return;

    callAgent.on("incomingCall", async (args) => {
      setIncomingCall(args.incomingCall);
      console.log("Incoming call", incomingCall);
    });
  }, [callAgent, incomingCall]);

  async function authenticate() {
    const client = await initCallAgent();
    try {
      const credential = new AzureCommunicationTokenCredential(token);
      const agent = await client.createCallAgent(credential);
      setCallAgent(agent);

      const deviceManager = await client.getDeviceManager();
      await deviceManager.askDevicePermission({ audio: true, video: false });
    } catch (error) {
      window?.alert("Please submit a valid token.");
    }
  }

  async function acceptCall() {
    if (!incomingCall) {
      throw new Error("Incoming call not initialized");
    }
    const call = await incomingCall.accept();
    setCall(call);
  }

  async function startCall() {
    if (!callAgent) {
      throw new Error("Call agent not initialized");
    }
    const call = callAgent.startCall([{ id: calleeId }]);
    setCall(call);
  }

  async function endCall() {
    if (!call) {
      throw new Error("Incoming call not initialized");
    }
    call.hangUp();
    setCall(undefined);
  }

  return (
    <main className="space-y-4 p-12">
      <p>
        Call Agent: {callAgent?.connectionState} {callAgent?.displayName}
      </p>
      <input
        value={token}
        onChange={(e) => setToken(e.target.value)}
        id="token-input"
        type="text"
        placeholder="User access token"
        disabled={!!callAgent}
      />
      <button
        id="token-submit"
        type="button"
        className="p-2 ml-2 bg-gray-200 disabled:opacity-50 rounded border border-black enabled:cursor-pointer enabled:hover:bg-gray-300 enabled:active:bg-gray-400"
        onClick={authenticate}
        disabled={!!callAgent}
      >
        Submit
      </button>
      <input
        id="callee-id-input"
        value={calleeId}
        onChange={(e) => setCalleeId(e.target.value)}
        type="text"
        placeholder="Who would you like to call?"
        className="block"
      />
      <div>
        <button
          className="p-3 bg-gray-200 disabled:opacity-50 rounded border border-black enabled:cursor-pointer enabled:hover:bg-gray-300 enabled:active:bg-gray-400"
          id="call-button"
          type="button"
          onClick={startCall}
          disabled={!callAgent}
        >
          Start Call
        </button>
        &nbsp;
        <button
          className="p-3 bg-gray-200 disabled:opacity-50 rounded border border-black enabled:cursor-pointer enabled:hover:bg-gray-300 enabled:active:bg-gray-400"
          id="accept-call-button"
          type="button"
          onClick={acceptCall}
          disabled={!incomingCall}
        >
          Accept Call
        </button>
        &nbsp;
        <button
          className="p-3 bg-gray-200 disabled:opacity-50 rounded border border-black enabled:cursor-pointer enabled:hover:bg-gray-300 enabled:active:bg-gray-400"
          id="hang-up-button"
          type="button"
          onClick={endCall}
          disabled={!call}
        >
          Hang Up
        </button>
      </div>
      <p>direction: {call?.direction}</p>
      <hr />
      <p>callerInfo: {call?.callerInfo.displayName}</p>
      <p>
        incomingCall: {incomingCall?.callerInfo.displayName}{" "}
        {incomingCall?.callerInfo.identifier?.kind}
      </p>
    </main>
  );
}
