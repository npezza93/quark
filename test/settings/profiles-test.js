/* global describe, beforeEach, it */

const {configure} = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')

configure({adapter: new Adapter()})

const Conf = require('conf')
const React = require('react')
const {mount} = require('enzyme')
const {assert} = require('chai')

const ProfilesComponent = require('../../app/settings/profiles')
const ProfileManager = require('../../app/configuration/profile-manager')

describe('Profiles Component', () => {
  describe('generic actions', () => {
    beforeEach(() => {
      this.conf = new Conf()
      this.conf.store = {activeProfileId: 1, profiles: {1: {id: 1}, 2: {id: 2}}}
      this.profileManager = new ProfileManager(this.conf)
      this.component = mount(
        React.createElement(
          ProfilesComponent, {profileManager: this.profileManager}
        )
      )
    })

    it('creates a new profile', () => {
      const newProfile = this.component.find('.new-profile')
      assert(newProfile.exists())

      newProfile.simulate('click')

      assert.lengthOf(this.component.find('archipelago-profile'), 3)
      assert.equal(this.profileManager.activeProfile().id, 3)
      assert.isDefined(this.profileManager.find(3))
    })

    it('has a header', () => {
      assert(this.component.find('.profile-header').exists())
    })

    it('displays all the profiles', () => {
      assert.lengthOf(this.component.find('archipelago-profile'), 2)
    })
  })

  describe('more than 1 profile', () => {
    beforeEach(() => {
      this.conf = new Conf()
      this.conf.store = {activeProfileId: 1, profiles: {1: {id: 1}, 2: {id: 2}}}
      this.profileManager = new ProfileManager(this.conf)
      this.component = mount(
        React.createElement(
          ProfilesComponent, {profileManager: this.profileManager}
        )
      )
    })

    it('removes the profile and resets the active profile', () => {
      const remover = this.component.find('.profile-remove').at(0)

      assert(remover.exists())

      remover.simulate('click')

      assert.equal(this.profileManager.activeProfile().id, 2)
      assert.lengthOf(this.profileManager.all(), 1)
      assert.isNull(this.profileManager.find(1))
    })

    it('changes trhe active profile', () => {
      const profile = this.component.find('archipelago-profile').at(1)

      assert(profile.exists())

      assert.equal(this.profileManager.activeProfile().id, 1)
      profile.simulate('click')
      assert.equal(this.profileManager.activeProfile().id, 2)
    })
  })
})