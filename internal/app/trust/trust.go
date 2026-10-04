package trust

import "errors"

type Level string

const (
	Trusted   Level = "trusted"
	Untrusted Level = "untrusted"
)

func Require(level Level) error {
	if level != Trusted {
		return errors.New("workspace is untrusted")
	}
	return nil
}
