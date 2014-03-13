/*
 * Spreed Speak Freely.
 * Copyright (C) 2013-2014 struktur AG
 *
 * This file is part of Spreed Speak Freely.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
define([
  'underscore',

  'directives/onenter',
  'directives/onescape',
  'directives/statusmessage',
  'directives/buddylist',
  'directives/settings',
  'directives/chat',
  'directives/audiovideo',
  'directives/usability',
  'directives/audiolevel',
  'directives/fileinfo',
  'directives/screenshare',
  'directives/roombar',
  'directives/socialshare'
], function(_, onEnter, onEscape, statusMessage, buddyList, settings, chat, audioVideo, usability, audioLevel, fileInfo, screenshare, roomBar, socialShare) {

  var directives = {
    onEnter: onEnter,
    onEscape: onEscape,
    statusMessage: statusMessage,
    buddyList: buddyList,
    settings: settings,
    chat: chat,
    audioVideo: audioVideo,
    usability: usability,
    audioLevel: audioLevel,
    fileInfo: fileInfo,
    screenshare: screenshare,
    roomBar: roomBar,
    socialShare: socialShare
  };

  var initialize = function (angModule) {
    _.each(directives, function(directive, name) {
      angModule.directive(name, directive);
    })
  };

  return {
    initialize: initialize
  };

});
