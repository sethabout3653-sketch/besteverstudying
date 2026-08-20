const { WebSocket } = require('ws');

const WISP_SERVERS = [
  "wss://wisp.mercurywork.shop/",
  "wss://anura.pro/",
  "wss://wisp.terbiumon.top/wisp/",
  "wss://ruby.rubynetwork.co/wisp/",
  "wss://wisp.rhw.one/",
  "wss://shadow.freewisp.org/wisp/"
];

async function testWisp(url, target) {
  return new Promise((resolve) => {
    const ws = new WebSocket(url);
    const timeout = setTimeout(() => {
      ws.terminate();
      resolve(`${url} -> TIMEOUT`);
    }, 5000);

    ws.on('open', () => {
      // Send WISP CONNECT packet
      // WISP v1 CONNECT packet: 
      // 0x01 (CONNECT)
      // Stream ID (4 bytes, e.g., 1)
      // Hostname length (1 byte)
      // Hostname (string)
      // Port (2 bytes, 443)
      
      const streamId = 1;
      const host = Buffer.from(target);
      const packet = Buffer.alloc(1 + 4 + 1 + host.length + 2);
      packet.writeUInt8(0x01, 0); // CONNECT
      packet.writeUInt32LE(streamId, 1);
      packet.writeUInt8(host.length, 5);
      host.copy(packet, 6);
      packet.writeUInt16LE(443, 6 + host.length);
      
      ws.send(packet);
    });

    ws.on('message', (data) => {
      clearTimeout(timeout);
      ws.terminate();
      resolve(`${url} -> SUCCESS (got data)`);
    });

    ws.on('error', (err) => {
      clearTimeout(timeout);
      resolve(`${url} -> ERROR: ${err.message}`);
    });
    
    ws.on('close', (code, reason) => {
        // if we didn't resolve yet
    })
  });
}

(async () => {
  for (const server of WISP_SERVERS) {
    console.log(await testWisp(server, "www.pornhub.com"));
  }
  for (const server of WISP_SERVERS) {
    console.log(await testWisp(server, "www.xvideos.com"));
  }
})();
