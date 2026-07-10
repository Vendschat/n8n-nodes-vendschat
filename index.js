const { VendsChatTrigger } = require('./dist/nodes/VendsChat/VendsChatTrigger.node');
const { VendsChat } = require('./dist/nodes/VendsChat/VendsChat.node');

module.exports = {
	nodes: [VendsChatTrigger, VendsChat],
};
