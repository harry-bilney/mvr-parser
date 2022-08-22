const fs = require('fs')
const xml2js = require('xml2js')
const parser = new xml2js.Parser({ attrkey: "ATTR" })

class Fixture {
    constructor(gdtfFixture) {
        this.uuid = gdtfFixture.uuid,
        this.name = gdtfFixture.name,
        this.class = gdtfFixture.classing,
        this.gdtfSpec = gdtfFixture.gdtfSpec,
        this.manufacture = gdtfFixture.gdtfSpec.split('@', 2)[0],
        this.fixtureName = gdtfFixture.gdtfSpec.split('@', 2)[1],
        this.userMode = gdtfFixture.gdtfMode,
        this.absoluteAddress = gdtfFixture.address
        this.fixtureID = gdtfFixture.fixtureID
    }
    getAddress() {
        let universe, address = ''
        if (this.absoluteAddress > 512) {
            universe = Math.floor((this.absoluteAddress / 512)).toString()
            address = this.absoluteAddress - (512 * universe).toString()
        } else {
            universe = '1'
            address = this.absoluteAddress
        }

        return [universe, address]
    }
}

class GDTFFixture {
    constructor(fixture) {
        this.name = fixture.ATTR.name,
        this.uuid = fixture.ATTR.uuid,
        this.matrix = fixture.Matrix[0],
        this.classing = fixture.Classing[0],
        this.gdtfSpec = fixture.GDTFSpec[0],
        this.gdtfMode = fixture.GDTFMode[0],
        this.address = fixture.Addresses[0].Address[0]._,
        this.fixtureID = fixture.FixtureID[0],
        this.unitNumber = fixture.UnitNumber[0],
        this.fixtureTypeID = fixture.FixtureTypeId[0],
        this.customID = fixture.CustomId[0],
        this.color = fixture.Color[0]
    }
}

class GeneralSceneDescription {
    constructor(xml) {
        this.verMajor = xml.GeneralSceneDescription.ATTR.verMajor,
        this.verMinor = xml.GeneralSceneDescription.ATTR.verMinor,
        this.userData = xml.GeneralSceneDescription.UserData,
        this.scene = xml.GeneralSceneDescription.Scene,
        this.layers = xml.GeneralSceneDescription.Scene[0].Layers
    }
}

class Layer {
    constructor(layer) {
        this.name = layer.Layer[0].ATTR.name,
        this.uuid = layer.Layer[0].ATTR.uuid,
        this.childList = layer.Layer[0].ChildList
    }
}

class MVR {
    constructor(gsd, layers, fixtures) {
        this.gsd = gsd,
        this.layers = layers,
        this.fixtures = fixtures
    }
}

function parse(arg) {
    let file = fs.readFileSync(arg, 'utf-8')
    let layers = []
    let gdtf_fixtures = []
    let fixtures = []
    let MVRObj = null

    parser.parseString(file, function(err, res) {
        if(err === null) {
            let _GeneralSceneDescription = new GeneralSceneDescription(res)
            _GeneralSceneDescription.layers.forEach(layer => {
                layers.push(new Layer(layer))
            })
            layers.forEach(i => {
                i.childList[0].Fixture.forEach(o => {
                    gdtf_fixtures.push(new GDTFFixture(o))
                })
            })
            MVRObj = new MVR(_GeneralSceneDescription, layers, gdtf_fixtures)
        }
        else {
            console.log(err)
        }
    })

    gdtf_fixtures.forEach(u => {
        fixtures.push(new Fixture(u))
    })

    console.log(fixtures[0])
}

module.exports = Fixture, GDTFFixture, GeneralSceneDescription, Layer, MVR, parse