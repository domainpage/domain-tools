require('dotenv').config()
const fs = require('fs');
const path = require('path');

const DOMAIN_LIST_FILENAME = 'domains.txt';

exports.options = {
    domainPageUsername: process.env.DOMAINPAGE_USERNAME,
    goDaddyApiKey: process.env.GODADDY_API_KEY,
    goDaddyApiSecret: process.env.GODADDY_API_SECRET,
    goDaddyCustomerNumber: process.env.GODADDY_CUSTOMER_ID,
    namecheapUsername: process.env.NAMECHEAP_USERNAME,
    namecheapApiKey: process.env.NAMECHEAP_API_KEY,
}

exports.getDomains = () => {
    const contents = fs.readFileSync(path.join(process.cwd(), DOMAIN_LIST_FILENAME), {
        encoding: 'utf-8',
        flag: 'r'
    })
    const list = contents.split('\n')
    return list.length ? list.filter(Boolean).sort() : []
}
