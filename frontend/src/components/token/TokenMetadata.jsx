import React from "react";
import Card from "../common/Card";

export default function TokenMetadata({ metadata }) {
  if (!metadata) return null;

  return (
    <Card>
      <h3 className="text-lg font-bold text-gray-800 mb-4">Token Metadata</h3>
      <div className="space-y-3">
        {metadata.description && (
          <div>
            <span className="text-sm text-gray-600">Description</span>
            <p className="text-gray-800">{metadata.description}</p>
          </div>
        )}
        {metadata.website && (
          <div>
            <span className="text-sm text-gray-600">Website</span>
            <a
              href={metadata.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline block"
            >
              {metadata.website}
            </a>
          </div>
        )}
      </div>
    </Card>
  );
}
