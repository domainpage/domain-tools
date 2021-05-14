const { options, getDomains } = require('../config');
const fetch = require("node-fetch");

const domains = getDomains()

const bulkDomainForwardingUpdate = ({ domainPageUsername, goDaddyCustomerNumber, goDaddyApiKey, goDaddyApiSecret }) => {
    return domains.forEach(async domain => {
        const payload = {
            type: "REDIRECT_TEMPORARY",
            url: `https://${domainPageUsername}.domainpage.io/${domain}`
        }

        const res = await fetch(`https://api.godaddy.com/v2/customers/${goDaddyCustomerNumber}/domains/forwards/${domain}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `sso-key ${goDaddyApiKey}:${goDaddyApiSecret}`
            },
            body: JSON.stringify(payload)
        })
        if (!res.ok) return console.error(`Error forwarding domain: ${domain} - [${res.status}]: ${res.statusText}`);
        console.info('----------')
        console.info(`Domain: ${domain}`)
        console.info(`Redirect: https://${domainPageUsername}.domainpage.io/${domain}`)
        console.info('----------\n')
    })
}

const bulkDomainTxtRecordUpdate = ({ domainPageUsername, goDaddyApiKey, goDaddyApiSecret }) => {
    return domains.forEach(async domain => {
        const payload = [
            {
                data: `domainpage-owner=${options.domainPageUsername}`,
                name: "@"
            }
        ]

        const res = await fetch(`https://api.godaddy.com/v1/domains/${domain}/records/TXT`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `sso-key ${goDaddyApiKey}:${goDaddyApiSecret}`
            },
            body: JSON.stringify(payload)
        })
        if (!res.ok) return console.error(`Error updating TXT record for domain: ${domain} - [${res.status}]: ${res.statusText}`);
        console.info('----------')
        console.info(`Domain: ${domain}`)
        console.info(`TXT Record: domainpage-owner=${domainPageUsername}`)
        console.info('----------\n')
    })
}

bulkDomainForwardingUpdate(options);
bulkDomainTxtRecordUpdate(options);
