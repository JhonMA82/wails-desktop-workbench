package documents

type Document struct {
	ID       string            `json:"id"`
	Resource string            `json:"resource"`
	Title    string            `json:"title"`
	Type     string            `json:"type"`
	Dirty    bool              `json:"dirty"`
	Metadata map[string]string `json:"metadata"`
	Value    int               `json:"value"`
}
