const rawr = require('../../');
const { worker } = require('../../transports/worker');

function add(x, y) {
  return x + y;
}

// create the rawr peer
const rawrPeer = rawr({transport: worker(), handlers: { add }});

// make RPC calls to the DOM
setInterval(async () => {
  const val = await rawrPeer.methods.getRandom();
  console.log('random from DOM', val);
}, 1000);

