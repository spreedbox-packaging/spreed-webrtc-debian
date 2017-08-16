package channelling

import (
	"net/http"
	"regexp"
)

type Config struct {
	Title                           string                    // Title
	Ver                             string                    `json:"-"` // Version (not exported to Javascript)
	S                               string                    // Static URL prefix with version
	B                               string                    // Base URL
	Token                           string                    // Server token
	Renegotiation                   bool                      // Renegotiation flag
	StunURIs                        []string                  // STUN server URIs
	TurnURIs                        []string                  // TURN server URIs
	TurnUsername                    string                    // Username for TURN server
	TurnPassword                    string                    // Password for TURN server
	Tokens                          bool                      // True when we got a tokens file
	Version                         string                    // Server version number
	UsersEnabled                    bool                      // Flag if users are enabled
	UsersAllowRegistration          bool                      // Flag if users can register
	UsersMode                       string                    // Users mode string
	DefaultRoomEnabled              bool                      // Flag if default room ("") is enabled
	Plugin                          string                    // Plugin to load
	AuthorizeRoomCreation           bool                      // Whether a user account is required to create rooms
	AuthorizeRoomJoin               bool                      // Whether a user account is required to join rooms
	Modules                         []string                  // List of enabled modules
	ModulesTable                    map[string]bool           `json:"-"` // Map of enabled modules
	GlobalRoomID                    string                    `json:"-"` // Id of the global room (not exported to Javascript)
	ContentSecurityPolicy           string                    `json:"-"` // HTML content security policy
	ContentSecurityPolicyReportOnly string                    `json:"-"` // HTML content security policy in report only mode
	RoomTypeDefault                 string                    `json:"-"` // New rooms default to this type
	RoomTypes                       map[*regexp.Regexp]string `json:"-"` // Map of regular expression -> room type
	RoomNameCaseSensitive           bool                      // Whether the room names are case sensitive.
	LockedRoomJoinableWithPIN       bool                      // Whether locked rooms should be joinable by providing the PIN the room was locked with
	PublicRoomNames                 *regexp.Regexp            `json:"-"` // Regular expression that specifies room paths that may be created/joined without a user account.
}

func (config *Config) WithModule(m string) bool {
	if val, ok := config.ModulesTable[m]; ok && val {
		return true
	}

	return false
}

func (config *Config) Get(request *http.Request) (int, interface{}, http.Header) {
	return 200, config, http.Header{"Content-Type": {"application/json; charset=utf-8"}}
}
