const { options, getDomains } = require('../config');
const fetch = require("node-fetch")
const xml = require("xml")
const parseXml = require("xml2js").parseString

const domains = getDomains()

const namecheapForwarding = ({ domainPageUsername, namecheapUsername, namecheapApiKey}) => {
    return domains.forEach(async domain => {
        const splitDomain = domain.split(".")
        const sld = splitDomain[0]
        const tld = splitDomain[1]

        const queryParams = {
            ApiUser: namecheapUsername,
            ApiKey: namecheapApiKey,
            UserName: namecheapUsername,
            Command: "namecheap.domains.dns.setHosts",
            ClientIp: "0.0.0.0",
            SLD: sld,
            TLD: tld,
            HostName1: "@",
            RecordType1: "URL",
            Address1: `https://${domainPageUsername}.domainpage.io/${domain}`,
            HostName2: "www",
            RecordType2: "URL",
            Address2: `https://${domainPageUsername}.domainpage.io/${domain}`,
            HostName3: "@",
            RecordType3: "TXT",
            Address3: `domainpage-owner=${domainPageUsername}`,
        }

        const apiUrl = new URL(`https://api.namecheap.com/xml.response`)
        apiUrl.search = new URLSearchParams(queryParams).toString()
        
        const data = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/xml",
            }
        })

        const responseAsXml = await data.text()
        let parsedXmlResponse = null
        const responseAsJson = await parseXml(responseAsXml, (err, result) => {
            if (err) return (parsedXmlResponse = err)
            return (parsedXmlResponse = result)
        })

        try {
            if (parsedXmlResponse["ApiResponse"]["$"]["Status"] === "OK") {
                console.info('----------')
                console.info(`Domain: ${domain}`)
                console.info(`Redirect: https://${domainPageUsername}.domainpage.io/${domain}`)
                console.info(`TXT Record: domainpage-owner=${domainPageUsername}`)
                console.info('----------\n')
            } else if (parsedXmlResponse["ApiResponse"]["Errors"][0]["Error"][0]["_"]) {
                console.error(`Error Forwarding Domain: ${domain}`)
                console.error(`${parsedXmlResponse["ApiResponse"]["Errors"][0]["Error"][0]["_"]}`)
            }
        } catch (e) {
            console.log(`Error Forwarding NameCheap Domain ${domain}:`, e)
        }
    })
}

namecheapForwarding(options);
